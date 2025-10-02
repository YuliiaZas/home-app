import { startSession, Types } from 'mongoose';
import { MongoError } from 'mongodb';
import { DIContainer, SERVICE_TOKENS } from '@di';
import { type IDashboardService, type IUserInstrumentService } from '@interfaces';
import { Dashboard, DashboardTemplate, type IDashboard, type IDashboardBase, type IDashboardTemplate, type IInstrumentInput, type IUserInstrument } from '@models';
import { type IDashboardRawResponse, type IDashboardResponse } from '@types';
import { AppError } from '@utils';

export class DashboardService implements IDashboardService {
  private ITEMS_POPULATE_OPTIONS = { path: 'tabs.cards.items', select: '_id type icon label' };

  private userInstrumentService: IUserInstrumentService;

  constructor() {
    this.userInstrumentService = DIContainer.resolve<IUserInstrumentService>(SERVICE_TOKENS.UserInstrument);
  }

  async getDashboards(userId: string): Promise<IDashboard[]> {
    return await Dashboard.find<IDashboard>({ userId }).select('title icon aliasId');
  }

  async createDashboard({ userId, title, icon, aliasId }: { userId: string; title: string; icon: string; aliasId: string }): Promise<IDashboard> {
    return await Dashboard.create({
      userId,
      title,
      icon,
      aliasId,
      tabs: [],
    });
  }

  async getDashboardByAliasId(userId: string, aliasId: string): Promise<IDashboardResponse> {
    const dashboard = await Dashboard.findByAliasId(aliasId, userId);
    if (!dashboard) throw new AppError('Dashboard not found', 404);

    return await this.resolveDashboardWithInstruments(dashboard, userId);
  }

  async updateDashboard({ userId, aliasId, title, icon, tabs }: {userId: string; aliasId: string; title?: string; icon?: string; tabs?: IDashboard['tabs'] }): Promise<IDashboardResponse> {
    const dashboard = await Dashboard.findByAliasId(aliasId, userId);
    if (!dashboard) throw new AppError('Dashboard not found', 404);

    if (tabs) {
      await this.userInstrumentService.updateUserInstrumentsForDashboard({
        userId,
        dashboardId: dashboard._id,
        dashboardTabs: tabs,
      });

      dashboard.tabs = tabs;
    }

    if (title) dashboard.title = title;
    if (icon) dashboard.icon = icon;

    await dashboard.save();

    return await this.resolveDashboardWithInstruments(dashboard, userId);
  }

  async deleteDashboard(userId: string, aliasId: string): Promise<void> {
    const result = await Dashboard.findOneAndDelete<IDashboard>({ userId, aliasId });
    if (!result?.value) throw new AppError('Dashboard not found', 404);

    await this.userInstrumentService.removeUserInstrumentsForDashboard({
      userId,
      dashboardId: result.value._id,
    });
  }

  async addDefaultDashboards(userId: string):
  Promise<{ created: string[]; skipped: string[]; failed: string[]; errors: string[] }> {
    const templates = await DashboardTemplate.find<IDashboardTemplate>().lean();
    if (!templates || templates.length === 0) throw new AppError('No dashboard templates found', 500);

    return await this.addDashboards(userId, templates);
  }

  private async addDashboards(userId: string, dashboards: IDashboardBase[]):
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

        await this.userInstrumentService.updateUserInstrumentsForDashboard({
          userId,
          dashboardId: dashboard._id,
          dashboardTabs: dashboard.tabs,
          session,
        });

        await dashboard.save({ session });

        await session.commitTransaction();

        dashboardsCreation.created.push(aliasId);

        console.log(`✅ Created default dashboard '${aliasId}' for user '${userId}'`);
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

  private async resolveDashboardWithInstruments(rawDashboard: IDashboard, userId: string): Promise<IDashboardResponse> {
    const dashboardPopulated = (await rawDashboard.populate(this.ITEMS_POPULATE_OPTIONS)).toObject();

    return this.resolveDashboard({
      dashboard: dashboardPopulated,
      userInstrumentMap: await this.userInstrumentService.getUserInstrumentsMapByDashboardId(userId, rawDashboard._id),
    });
  }


  private resolveDashboard({ dashboard, userInstrumentMap }: {
    dashboard: IDashboardRawResponse;
    userInstrumentMap: Map<string, IUserInstrument>;
  }): IDashboardResponse {
    return {
      ...dashboard,
      tabs: (dashboard.tabs || []).map((tab) => ({
        ...tab,
        cards: (tab.cards || []).map((card) => ({
          ...card,
          items: (card.items || []).map((instrument) => {
            const userDevice = userInstrumentMap.get(instrument._id.toString());
            const resolvedInstrument: IInstrumentInput & { _id: string } = {
              ...instrument,
              label: userDevice?.aliasLabel || instrument.label,
              ...(userDevice?.state !== undefined ? { state: userDevice?.state } : {}),
              ...(userDevice?.value !== undefined ? { value: userDevice?.value } : {}),
            }
  
            return resolvedInstrument;
          }),
        })),
      })),
    };
  }
}
