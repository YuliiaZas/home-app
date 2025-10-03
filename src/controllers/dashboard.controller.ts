import { Response } from 'express';
import { DIContainer, SERVICE_TOKENS } from '@di';
import { type IDashboardService } from '@interfaces';
import {
  type AuthenticatedRequest,
  type IDashboardAliasId,
  type IDashboardCreate,
  type IDashboardUpdate,
} from '@types';
import { handleCommonErrors } from '@utils';

export class DashboardController {
  private dashboardService: IDashboardService;

  constructor() {
    this.dashboardService = DIContainer.resolve<IDashboardService>(SERVICE_TOKENS.Dashboard);
  }

  async getDashboards(req: AuthenticatedRequest, res: Response) {
    try {
      res.status(200).json(await this.dashboardService.getDashboards(req.user.id));
    } catch (error) {
      handleCommonErrors(error, res, 'Get Dashboards');
    }
  }

  async createDashboard(req: AuthenticatedRequest<object, IDashboardCreate>, res: Response) {
    try {
      const { title, icon, aliasId } = req.body;
      res.status(201).json(await this.dashboardService.createDashboard(req.user.id, { aliasId, title, icon }));
    } catch (error) {
      handleCommonErrors(error, res, 'Get Dashboards');
    }
  }

  async getDashboardByAliasId(req: AuthenticatedRequest<IDashboardAliasId>, res: Response) {
    try {
      res.status(200).json(await this.dashboardService.getDashboardByAliasId(req.user.id, req.params.aliasId));
    } catch (error) {
      handleCommonErrors(error, res, 'Get Dashboard by Alias ID');
    }
  }

  async updateDashboard(req: AuthenticatedRequest<IDashboardAliasId, IDashboardUpdate>, res: Response) {
    try {
      const { tabs, title, icon } = req.body;
      const { aliasId } = req.params;

      res.status(200).json(await this.dashboardService.updateDashboard(req.user.id, aliasId, { tabs, title, icon }));
    } catch (error) {
      handleCommonErrors(error, res, 'Get Dashboards');
    }
  }

  async deleteDashboard(req: AuthenticatedRequest<IDashboardAliasId>, res: Response) {
    try {
      await this.dashboardService.deleteDashboard(req.user.id, req.params.aliasId);

      res.status(204).send();
    } catch (error) {
      handleCommonErrors(error, res, 'Delete Dashboard');
    }
  }

  async createDefaultDashboards(req: AuthenticatedRequest, res: Response) {
    try {
      res.status(200).json(await this.dashboardService.addDefaultDashboards(req.user.id));
    } catch (error) {
      handleCommonErrors(error, res, 'Create Default Dashboards');
    }
  }
}
