import { type ClientSession } from 'mongoose';
import { type IInstrument } from '@models';

export interface IInstrumentService {
  getInstruments(): Promise<IInstrument[]>;

  getInstrumentById(instrumentId: string, session: ClientSession | null): Promise<IInstrument | null>;
}
