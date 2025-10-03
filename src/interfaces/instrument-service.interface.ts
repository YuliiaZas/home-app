import { type ClientSession } from 'mongoose';
import { type IInstrument } from '@models';
import { type IInstrumentResponse } from '@types';

export interface IInstrumentService {
  getInstruments(): Promise<IInstrumentResponse[]>;

  getInstrumentById(instrumentId: string, session: ClientSession | null): Promise<IInstrument | null>;
}
