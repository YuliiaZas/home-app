import { IDashboard, IDashboardBase } from '@models';
import { IDashboardResponse } from '@types';

export interface IDashboardService {
  ITEMS_POPULATE_OPTIONS: {path: string, select: string};

  addDefaultDashboards(userId: string):
  Promise<{ created: string[]; skipped: string[]; failed: string[]; errors: string[] }>;

  addDashboards(userId: string, dashboards: IDashboardBase[]):
  Promise<{ created: string[]; skipped: string[]; failed: string[]; errors: string[] }>;

  resolveDashboardWithInstruments(rawDashboard: IDashboard, userId: string): Promise<IDashboardResponse>;
}
