import { Request, Response } from 'express';
import { DIContainer, SERVICE_TOKENS } from '@di';
import { Dashboard, IDashboard } from '@models';
import { IDashboardService, IUserInstrumentService } from '@interfaces';
import { AppError, getInstrumentIdsFromTabs, handleCommonErrors } from '@utils';

export class DashboardController {
  private dashboardService: IDashboardService;
  private userInstrumentService: IUserInstrumentService;

  constructor() {
    this.dashboardService = DIContainer.resolve<IDashboardService>(SERVICE_TOKENS.Dashboard);
    this.userInstrumentService = DIContainer.resolve<IUserInstrumentService>(SERVICE_TOKENS.UserInstrument);
  }

  async getDashboards(req: Request, res: Response) {
    try {
      const dashboards = await Dashboard.find<IDashboard>({ userId: req.user.id }).select('title icon aliasId');
      res.json(dashboards || []);
    } catch (error) {
      handleCommonErrors(error, res, 'Get Dashboards');
    }
  }

  async createDashboard(req: Request, res: Response) {
    try {
      const { title, icon, aliasId } = req.body;

      const dashboard: IDashboard = await Dashboard.create({
        userId: req.user.id,
        title,
        icon,
        aliasId,
        tabs: [],
      });

      res.status(201).json(dashboard);
    } catch (error) {
      handleCommonErrors(error, res, 'Get Dashboards');
    }
  }

  async getDashboardByAliasId(req: Request, res: Response) {
    try {
      const dashboard = await Dashboard.findByAliasId(req.params.aliasId, req.user.id);
      if (!dashboard) throw new AppError('Dashboard not found', 404);

      res.status(200).json(await this.dashboardService.resolveDashboardWithInstruments(dashboard, req.user.id));
    } catch (error) {
      handleCommonErrors(error, res, 'Get Dashboard by Alias ID');
    }
  }

  async updateDashboard(req: Request, res: Response) {
    try {
      const { tabs, title, icon } = req.body;

      const dashboard = await Dashboard.findByAliasId(req.params.aliasId, req.user.id);
      if (!dashboard) throw new AppError('Dashboard not found', 404);

      if (tabs) {
        await this.userInstrumentService.updateUserInstrumentsForDashboard({
          userId: req.user.id,
          dashboardId: dashboard._id,
          updatedInstrumentIds: getInstrumentIdsFromTabs(tabs),
        });

        dashboard.tabs = tabs;
      }

      if (title) dashboard.title = title;
      if (icon) dashboard.icon = icon;

      await dashboard.save();

      res.status(200).json(await this.dashboardService.resolveDashboardWithInstruments(dashboard, req.user.id));
    } catch (error) {
      handleCommonErrors(error, res, 'Get Dashboards');
    }
  }

  async deleteDashboard(req: Request, res: Response) {
    try {
      const result = await Dashboard.findOneAndDelete<IDashboard>({
        aliasId: req.params.aliasId,
        userId: req.user.id,
      });

      if (!result?.value) throw new AppError('Dashboard not found', 404);

      await this.userInstrumentService.removeUserInstrumentsForDashboard({
        userId: req.user.id,
        dashboardId: result.value._id,
      });

      res.status(204).send();
    } catch (error) {
      handleCommonErrors(error, res, 'Delete Dashboard');
    }
  }

  async createDefaultDashboards(req: Request, res: Response) {
    try {
      const dashboardsCreation = await this.dashboardService.addDefaultDashboards(req.user.id);

      res.status(200).json(dashboardsCreation);
    } catch (error) {
      handleCommonErrors(error, res, 'Create Default Dashboards');
    }
  }
}
