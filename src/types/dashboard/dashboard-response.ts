import { ITab } from '@models';
import { IDashboardOverviewResponse } from './dashboard-overview';
import { IDashboardUserInstrumentResponse } from '../user-instrument';

export type IDashboardResponse = IDashboardOverviewResponse & {
  tabs: ITab<IDashboardUserInstrumentResponse>[]
};
