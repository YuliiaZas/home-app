import { IDashboard } from '@models';

export enum DASHBOARD_CREATE_KEYS {
  'aliasId',
  'title',
  'icon',
}

export type IDashboardCreate = Pick<IDashboard, keyof typeof DASHBOARD_CREATE_KEYS>;
