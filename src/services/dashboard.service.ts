import mongoose from 'mongoose';
import { Dashboard, DashboardTemplate, IDashboard, IDashboardTemplate, ITab } from '@models';
import { AppError, getInstrumentIdsFromTabs } from '@utils';
import { UserInstrumentService } from './user-instrument.service';

export class DashboardService {
  static async addDefaultDashboards(userId: string): Promise<IDashboard[]> {
    const templates = await DashboardTemplate.find<IDashboardTemplate>().lean();
    if (!templates || templates.length === 0) throw new AppError('No dashboard templates found', 500);

    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const dashboardsToCreate = templates.map(tpl => {
        return new Dashboard({
          ownerUserId: userId,
          title: tpl.title,
          icon: tpl.icon,
          aliasId: tpl.aliasId,
          tabs: tpl.tabs,
        });
      });

      dashboardsToCreate.forEach(dashboard => {
        if (!dashboard._id) {
          dashboard._id = new mongoose.Types.ObjectId();
        }
      });

      const updatedUserInstruments = await Promise.all(
        dashboardsToCreate.map(async (d) =>
          await UserInstrumentService.updateUserInstrumentsForDashboard({
            userId,
            dashboardId: d._id,
            updatedInstrumentIds: getInstrumentIdsFromTabs(d.tabs) || [],
            session,
          })
        )
      );

      await Dashboard.insertMany(dashboardsToCreate, { session });

      await session.commitTransaction();

      updatedUserInstruments.forEach(({ dashboardId, addedInstruments, removedInstruments }) => {
        console.log(
          `✅ Updated UserInstruments for user ${userId} and dashboard ${dashboardId}. Added: ${addedInstruments}, Removed: ${removedInstruments}`
        );
      });
      console.log(`✅ Created ${dashboardsToCreate.length} default dashboards for user ${userId}`);

      return dashboardsToCreate;
    } catch (error) {
      await session.abortTransaction();
      console.error('❌ Failed to create default dashboards:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }
}
