import { type IDashboard } from '@models';
import { type IDashboardCreate, type IDashboardUpdate, type IDashboardResponse } from '@types';

export interface IDashboardService {
  getDashboards(userId: string): Promise<IDashboard[]>;

  createDashboard(userId: string, params: IDashboardCreate): Promise<IDashboard>;

  getDashboardByAliasId(userId: string, aliasId: string): Promise<IDashboardResponse>;

  updateDashboard(userId: string, aliasId: string, params: IDashboardUpdate): Promise<IDashboardResponse>;

  deleteDashboard(userId: string, aliasId: string): Promise<void>;

  addDefaultDashboards(userId: string):
  Promise<{ created: string[]; skipped: string[]; failed: string[]; errors: string[] }>;
}
