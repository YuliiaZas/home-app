import { type ClientSession } from 'mongoose';
import { type IInstrumentService } from '@interfaces';
import { type IInstrument, Instrument } from '@models';
import { type IInstrumentResponse, INSTRUMENT_KEYS } from '@types';
import { enumKeysToSelector } from '@utils';

export class InstrumentService implements IInstrumentService {
  async getInstruments(): Promise<IInstrumentResponse[]> {
    return await Instrument.find().select(enumKeysToSelector(INSTRUMENT_KEYS)).lean<IInstrumentResponse[]>();
  }

  async getInstrumentById(instrumentId: string, session: ClientSession | null = null): Promise<IInstrument | null> {
    return await Instrument.findById(instrumentId).session(session);
  }
}
