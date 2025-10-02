import { ClientSession } from 'mongoose';
import { IUserInstrument } from '@models';

export interface IUserInstrumentService {
  updateUserInstrumentsForDashboard(params: {
    userId: string;
    dashboardId: string;
    updatedInstrumentIds: string[];
    session?: ClientSession | null;
  }): Promise<{ dashboardId: string; addedInstruments: number; removedInstruments: number }>;

  removeUserInstrumentsForDashboard({ userId, dashboardId }: { userId: string; dashboardId: string }): Promise<void>;

  getUserInstrumentsMapByDashboardId(userId: string, dashboardId: string): Promise<Map<string, IUserInstrument>>;
}
