import { startSession, Types } from 'mongoose';
import { MongoError } from 'mongodb';
import { DIContainer, SERVICE_TOKENS } from '@di';
import { IDashboardService, IUserInstrumentService } from '@interfaces';
import { Dashboard, DashboardTemplate, IDashboard, IDashboardBase, IDashboardTemplate } from '@models';
import { IDashboardResponse } from '@types';
import { AppError, getInstrumentIdsFromTabs, resolveDashboard } from '@utils';

export class DashboardService implements IDashboardService {
  private userInstrumentService: IUserInstrumentService;

  constructor() {
    this.userInstrumentService = DIContainer.resolve<IUserInstrumentService>(SERVICE_TOKENS.UserInstrument);
  }

  ITEMS_POPULATE_OPTIONS = { path: 'tabs.cards.items', select: '_id type icon label' };

  async addDefaultDashboards(userId: string):
  Promise<{ created: string[]; skipped: string[]; failed: string[]; errors: string[] }> {
    const templates = await DashboardTemplate.find<IDashboardTemplate>().lean();
    if (!templates || templates.length === 0) throw new AppError('No dashboard templates found', 500);

    return await this.addDashboards(userId, templates);
  }

  async addDashboards(userId: string, dashboards: IDashboardBase[]):
  Promise<{ created: string[]; skipped: string[]; failed: string[]; errors: string[] }> {
    const dashboardsCreation: { created: string[]; skipped: string[]; failed: string[]; errors: string[] } = {
      created: [],
      skipped: [],
      failed: [],
      errors: [],
    };

    for (const d of dashboards) {
      const session = await startSession();

      const aliasId = d.aliasId;

      try {
        session.startTransaction();

        const dashboard = new Dashboard({
          _id: new Types.ObjectId(),
          userId: userId,
          title: d.title,
          icon: d.icon,
          aliasId: d.aliasId,
          tabs: d.tabs,
        });

        const { addedInstruments, removedInstruments } = await this.userInstrumentService.updateUserInstrumentsForDashboard({
          userId,
          dashboardId: dashboard._id,
          updatedInstrumentIds: getInstrumentIdsFromTabs(dashboard.tabs) || [],
          session,
        });

        await dashboard.save({ session });

        await session.commitTransaction();

        dashboardsCreation.created.push(aliasId);

        console.log(`✅ Created default dashboard '${aliasId}' for user '${userId}'`);
        console.log(
          `✅ Updated UserInstruments for user '${userId}' and dashboard '${dashboard._id}'. Added: ${addedInstruments}, Removed: ${removedInstruments}`
        );
      } catch (error) {
        await session.abortTransaction();
        if (error instanceof MongoError && error.code === 11000 && 'keyPattern' in error && typeof error.keyPattern === 'object' && error.keyPattern !== null && 'aliasId' in error.keyPattern) {
          dashboardsCreation.skipped.push(aliasId);
          console.warn(`⚠️ Dashboard from template '${aliasId}' already exists for user '${userId}'. Skipping.`);
          continue;
        }
        dashboardsCreation.failed.push(aliasId);
        dashboardsCreation.errors.push(error instanceof Error ? `${aliasId}: ${error.message}` : `${aliasId}: Unknown error`);
        console.error(`❌ Failed to create dashboard from template '${aliasId}' for user '${userId}':`, error);
      } finally {
        session.endSession();
      }
    }

    return dashboardsCreation;
  }

  async resolveDashboardWithInstruments(rawDashboard: IDashboard, userId: string): Promise<IDashboardResponse> {
    const dashboard = (await rawDashboard.populate(this.ITEMS_POPULATE_OPTIONS)).toObject();

    return resolveDashboard({
      dashboard,
      userInstrumentMap: await this.userInstrumentService.getUserInstrumentsMapByDashboardId(userId, dashboard._id),
    });
  }
}
