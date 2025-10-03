import { type ClientSession } from 'mongoose';
import { type ITab, type IUserInstrument } from '@models';
import { type IUserInstrumentResponse } from '@types';

export interface IUserInstrumentService {
  updateUserInstrumentState(params: {
    userId: string;
    instrumentId: string;
    state: boolean;
  }): Promise<IUserInstrument | null>;

  getUserInstruments(userId: string): Promise<IUserInstrumentResponse[]>;

  updateUserInstrumentsForDashboard(params: {
    userId: string;
    dashboardId: string;
    dashboardTabs: ITab[];
    session?: ClientSession | null;
  }): Promise<void>;

  removeUserInstrumentsForDashboard({ userId, dashboardId }: { userId: string; dashboardId: string }): Promise<void>;

  getUserInstrumentsMapByDashboardId(userId: string, dashboardId: string): Promise<Map<string, IUserInstrument>>;
}
