import { Request, Response } from 'express';
import { Instrument } from '@models';

export class InstrumentController {
  static async getInstruments(req: Request, res: Response) {
    const instruments = await Instrument.find();
    res.json(instruments);
  }
}
