import { IDashboard } from '@models';

export enum DASHBOARD_UPDATE_KEYS {
  'title',
  'icon',
  'tabs'
}

export type IDashboardUpdate = Partial<Pick<IDashboard, keyof typeof DASHBOARD_UPDATE_KEYS>>;
