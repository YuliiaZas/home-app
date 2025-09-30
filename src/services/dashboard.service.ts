import { startSession, Types } from 'mongoose';
import { Dashboard, DashboardTemplate, IDashboard, IDashboardBase, IDashboardTemplate } from '@models';
import { AppError, getInstrumentIdsFromTabs, resolveDashboard } from '@utils';
import { UserInstrumentService } from './user-instrument.service';
import { MongoError } from 'mongodb';

export class DashboardService {
  static ITEMS_POPULATE_OPTIONS = { path: 'tabs.cards.items', select: '_id type icon label' };

  static async addDefaultDashboards(userId: string):
  Promise<{ created: string[]; skipped: string[]; failed: string[]; errors: string[] }> {
    const templates = await DashboardTemplate.find<IDashboardTemplate>().lean();
    if (!templates || templates.length === 0) throw new AppError('No dashboard templates found', 500);

    return await this.addDashboards(userId, templates);
  }

  static async addDashboards(userId: string, dashboards: IDashboardBase[]):
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

        const { addedInstruments, removedInstruments } = await UserInstrumentService.updateUserInstrumentsForDashboard({
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

  static async resolveDashboardWithInstruments(rawDashboard: IDashboard, userId: string) {
    const dashboard = (await rawDashboard.populate(DashboardService.ITEMS_POPULATE_OPTIONS)).toObject();

    return resolveDashboard({
      dashboard,
      userInstrumentMap: await UserInstrumentService.getUserInstrumentsMapByDashboardId(userId, dashboard._id),
    });
  }
}
