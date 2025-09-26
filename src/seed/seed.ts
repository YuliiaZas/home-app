import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { connectDatabase } from '@config';
import { Dashboard, DashboardTemplate, DashboardTemplateInput, IDashboardBaseSeed, IInstrument, Instrument, User, UserInstrument } from '@models';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seed() {
  await connectDatabase();
  
  // 1. Clear existing collections
  await Instrument.syncIndexes();
  await DashboardTemplate.syncIndexes();
  await Dashboard.syncIndexes();

  await Instrument.deleteMany({});
  await DashboardTemplate.deleteMany({});

  await User.deleteMany({});
  await UserInstrument.deleteMany({});
  await Dashboard.deleteMany({});

  // 2. Load JSON files
  const instrumentsPath = path.join(__dirname, 'data', 'instruments.db.json');
  const dashboardsPath = path.join(__dirname, 'data', 'dashboards.db.json');

  const instrumentsJson: IInstrument[] = JSON.parse(fs.readFileSync(instrumentsPath, 'utf-8'));
  const dashboardsJson: IDashboardBaseSeed[] = JSON.parse(fs.readFileSync(dashboardsPath, 'utf-8'));

  // 3. Insert instruments
  const aliasToId = new Map<string, string>();

  const instruments = await Instrument.insertMany(instrumentsJson);
  console.log(`✅ Inserted ${instruments.length} instruments`);

  instruments.forEach((instrument: IInstrument) => {
    if (instrument.aliasId) {
      aliasToId.set(instrument.aliasId, instrument._id.toString());
    }
  });

  // 4. Transform dashboards: replace `itemAliasIds` with instrument IDs
  const transformedDashboards: DashboardTemplateInput[] = dashboardsJson.map((tpl) => {
    const dashboard: DashboardTemplateInput = {
      isTemplate: true,
      ...tpl,
      tabs: tpl.tabs.map((tabTpl) => ({
        ...tabTpl,
        cards: tabTpl.cards.map((cardTpl) => ({
          ...cardTpl,
          items: cardTpl.itemAliasIds.map((aliasId: string) => aliasToId.get(aliasId) || aliasId),
        })),
      })),
    };
    return dashboard;
  });

  // 5. Insert dashboards as templates
  const dashboards = await DashboardTemplate.insertMany(transformedDashboards);
  console.log(`✅ Inserted ${dashboards.length} dashboard templates`);

  await mongoose.disconnect();
  console.log('🚀 Seeding complete');
}

seed().catch((err) => {
  console.error('❌ Seeding failed', err);
  process.exit(1);
});
