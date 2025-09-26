import { Request, Response } from 'express';
import { Dashboard, IDashboard, IInstrument, Instrument, IUserInstrument, UserInstrument } from '@models';
import { DashboardService, UserInstrumentService } from '@services';
import { AppError, getInstrumentIdsFromTabs, handleCommonErrors, resolveDashboard } from '@utils';

export class DashboardController {
  static async getDashboards(req: Request, res: Response) {
    try {
      const dashboards = await Dashboard.find<IDashboard>({ ownerUserId: req.user.id }).select("title icon");
      res.json(dashboards || []);
    } catch (error) {
      handleCommonErrors(error, res, "Get Dashboards");
    }
  }

  static async createDashboard(req: Request, res: Response) {
    try {
      const { title, icon } = req.body;

      const dashboard: IDashboard = await Dashboard.create({
        ownerUserId: req.user.id,
        title,
        icon,
        tabs: [],
      });

      res.status(201).json(dashboard);
    } catch (error) {
      handleCommonErrors(error, res, "Get Dashboards");
    }
  }

  static async getDashboardById(req: Request, res: Response) {
    try {
      const { dashboardId } = req.params;
      const dashboard = await Dashboard.findOne<IDashboard>({
        _id: dashboardId,
        ownerUserId: req.user.id,
      });
      if (!dashboard) throw new AppError("Dashboard not found", 404);

      const instrumentIds = getInstrumentIdsFromTabs(dashboard.tabs);

      const instruments = await Instrument.find<IInstrument>({
        _id: { $in: instrumentIds },
      });

      const userInstruments = await UserInstrument.find<IUserInstrument>({
        ownerUserId: req.user.id,
        dashboards: dashboardId,
      });

      res.json(
        resolveDashboard({
          dashboard,
          instruments,
          userInstruments,
        })
      );
    } catch (error) {
      handleCommonErrors(error, res, "Get Dashboard by ID");
    }
  }

  static async updateDashboard(req: Request, res: Response) {
    try {
      const { tabs, title, icon } = req.body;

      let dashboard = await Dashboard.findOne({
        _id: req.params.dashboardId,
        ownerUserId: req.user.id,
      });
      if (!dashboard) throw new AppError("Dashboard not found", 404);

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

      res.status(200).json(dashboard);
    } catch (error) {
      handleCommonErrors(error, res, "Get Dashboards");
    }
  }

  static async deleteDashboard(req: Request, res: Response) {
    try {
      const result = await Dashboard.findOneAndDelete<IDashboard>({
        _id: req.params.dashboardId,
        ownerUserId: req.user.id,
      });

      if (!result?.value) throw new AppError("Dashboard not found", 404);

      await UserInstrumentService.removeUserInstrumentsForDashboard({
        userId: req.user.id,
        dashboardId: result.value._id,
      });

      res.status(204).send();
    } catch (error) {
      handleCommonErrors(error, res, "Delete Dashboard");
    }
  }

  static async createDefaultDashboards(req: Request, res: Response) {
    try {
      const dashboards: IDashboard[] = await DashboardService.addDefaultDashboards(req.user.id);

      res.status(201).json(dashboards);
    } catch (error) {
      handleCommonErrors(error, res, "Create Default Dashboards");
    }
  }
}
