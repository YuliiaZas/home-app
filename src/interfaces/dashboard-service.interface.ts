import {
  type IDashboardCreate,
  type IDashboardUpdate,
  type IDashboardResponse,
  type IDashboardsCreationResult,
  type IDashboardOverviewResponse,
} from '@types';

export interface IDashboardService {
  getDashboards(userId: string): Promise<IDashboardOverviewResponse[]>;

  createDashboard(userId: string, params: IDashboardCreate): Promise<IDashboardResponse>;

  getDashboardByAliasId(userId: string, aliasId: string): Promise<IDashboardResponse>;

  updateDashboard(userId: string, aliasId: string, params: IDashboardUpdate): Promise<IDashboardResponse>;

  deleteDashboard(userId: string, aliasId: string): Promise<void>;

  addDefaultDashboards(userId: string): Promise<IDashboardsCreationResult>;
}
