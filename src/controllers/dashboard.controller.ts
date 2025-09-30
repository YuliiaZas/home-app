import { Request, Response } from 'express';
import { Dashboard, IDashboard, IUserInstrument, UserInstrument } from '@models';
import { DashboardService, UserInstrumentService } from '@services';
import { AppError, getInstrumentIdsFromTabs, handleCommonErrors, resolveDashboard } from '@utils';

export class DashboardController {
  static async getDashboards(req: Request, res: Response) {
    try {
      const dashboards = await Dashboard.find<IDashboard>({ userId: req.user.id }).select('title icon aliasId');
      res.json(dashboards || []);
    } catch (error) {
      handleCommonErrors(error, res, 'Get Dashboards');
    }
  }

  static async createDashboard(req: Request, res: Response) {
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

  static async getDashboardByAliasId(req: Request, res: Response) {
    try {
      const dashboard = await Dashboard.findByAliasId(req.params.aliasId, req.user.id);
      if (!dashboard) throw new AppError('Dashboard not found', 404);

      const userInstruments = await UserInstrument.find<IUserInstrument>({
        userId: req.user.id,
        dashboards: dashboard._id,
      }).lean();

      res.status(200).json(resolveDashboard({
        dashboard: (await dashboard.populate(DashboardService.ITEMS_POPULATE_OPTIONS)).toObject(),
        userInstruments
      }));
    } catch (error) {
      handleCommonErrors(error, res, 'Get Dashboard by Alias ID');
    }
  }

  static async updateDashboard(req: Request, res: Response) {
    try {
      const { tabs, title, icon } = req.body;

      const dashboard = await Dashboard.findByAliasId(req.params.aliasId, req.user.id);
      if (!dashboard) throw new AppError('Dashboard not found', 404);

      if (tabs) {
        await UserInstrumentService.updateUserInstrumentsForDashboard({
          userId: req.user.id,
          dashboardId: dashboard._id,
          updatedInstrumentIds: getInstrumentIdsFromTabs(tabs),
        });

        dashboard.tabs = tabs;
      }

      if (title) dashboard.title = title;
      if (icon) dashboard.icon = icon;

      await dashboard.save();

      const userInstruments = await UserInstrument.find<IUserInstrument>({
        userId: req.user.id,
        dashboards: dashboard._id,
      }).lean();

      res.status(200).json(resolveDashboard({
        dashboard: (await dashboard.populate(DashboardService.ITEMS_POPULATE_OPTIONS)).toObject(),
        userInstruments
      }));
    } catch (error) {
      handleCommonErrors(error, res, 'Get Dashboards');
    }
  }

  static async deleteDashboard(req: Request, res: Response) {
    try {
      const result = await Dashboard.findOneAndDelete<IDashboard>({
        aliasId: req.params.aliasId,
        userId: req.user.id,
      });

      if (!result?.value) throw new AppError('Dashboard not found', 404);

      await UserInstrumentService.removeUserInstrumentsForDashboard({
        userId: req.user.id,
        dashboardId: result.value._id,
      });

      res.status(204).send();
    } catch (error) {
      handleCommonErrors(error, res, 'Delete Dashboard');
    }
  }

  static async createDefaultDashboards(req: Request, res: Response) {
    try {
      const dashboards: IDashboard[] = await DashboardService.addDefaultDashboards(req.user.id);

      res.status(201).json(dashboards);
    } catch (error) {
      handleCommonErrors(error, res, 'Create Default Dashboards');
    }
  }
}
