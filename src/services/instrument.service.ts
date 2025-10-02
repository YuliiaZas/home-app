import { type ClientSession } from 'mongoose';
import { type IInstrumentService } from '@interfaces';
import { type IInstrument, Instrument } from '@models';

export class InstrumentService implements IInstrumentService {
  async getInstruments(): Promise<IInstrument[]> {
    return await Instrument.find();
  }

  async getInstrumentById(instrumentId: string, session: ClientSession | null = null): Promise<IInstrument | null> {
    return await Instrument.findById(instrumentId).session(session);
  }
}
