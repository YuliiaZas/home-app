import { IDashboard } from '@models';

export enum DASHBOARD_OVERVIEW_KEYS {
  'aliasId',
  'title',
  'icon',
}

export type IDashboardOverviewResponse = Pick<IDashboard, keyof typeof DASHBOARD_OVERVIEW_KEYS>;
