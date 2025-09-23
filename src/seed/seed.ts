import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { DashboardTemplate, IDashboardTemplateData, IDashboardTemplateInitial, Instrument } from '@models';

async function connectDatabase() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/home-app');
  console.log('✅ MongoDB connected (seed)');
}

async function seed() {
  await connectDatabase();

  // 1. Clear existing collections
  await Instrument.deleteMany({});
  await DashboardTemplate.deleteMany({});

  // 2. Load JSON files
  const instrumentsPath = path.join(__dirname, 'data', 'instruments.db.json');
  const dashboardsPath = path.join(__dirname, 'data', 'dashboards.db.json');

  const instrumentsJson = JSON.parse(fs.readFileSync(instrumentsPath, 'utf-8'));
  const dashboardsJson = JSON.parse(fs.readFileSync(dashboardsPath, 'utf-8'));

  // 3. Insert instruments
  const instruments = await Instrument.insertMany(instrumentsJson);
  console.log(`✅ Inserted ${instruments.length} instruments`);

  const aliasToId = new Map<string, string>();
  instruments.forEach((instrument) => {
    if (instrument.alias) {
      aliasToId.set(instrument.alias, instrument._id.toString());
    }
  });

  // 4. Transform dashboards: replace itemAliases with instrument IDs
  const transformedDashboards: IDashboardTemplateData[] = dashboardsJson.map((tpl: IDashboardTemplateInitial) => {
    const dashboard: IDashboardTemplateData = {
      isTemplate: true,
      title: tpl.title,
      icon: tpl.icon,
      tabs: tpl.tabs.map((tab) => ({
        title: tab.title,
        cards: tab.cards.map((card) => ({
          title: card.title,
          layout: card.layout,
          items: card.itemAliases
            .map((alias: string) => aliasToId.get(alias))
            .filter((id): id is string => id !== undefined),
        })),
      })),
    };
    return dashboard;
  });

  // 5. Insert dashboards as templates
  await DashboardTemplate.insertMany(transformedDashboards);
  console.log('✅ Inserted dashboard templates');

  await mongoose.disconnect();
  console.log('🚀 Seeding complete');
}

seed().catch((err) => {
  console.error('❌ Seeding failed', err);
  process.exit(1);
});
