import { type IDashboard } from '@models';
import { type IDashboardResponse } from '@types';

export interface IDashboardService {
  getDashboards(userId: string): Promise<IDashboard[]>;

  createDashboard(params: { userId: string; title: string; icon: string; aliasId: string }): Promise<IDashboard>;

  getDashboardByAliasId(userId: string, aliasId: string): Promise<IDashboardResponse>;

  updateDashboard(params: {userId: string; aliasId: string; title?: string; icon?: string; tabs?: IDashboard['tabs'] }): Promise<IDashboardResponse>;

  deleteDashboard(userId: string, aliasId: string): Promise<void>;

  addDefaultDashboards(userId: string):
  Promise<{ created: string[]; skipped: string[]; failed: string[]; errors: string[] }>;
}
