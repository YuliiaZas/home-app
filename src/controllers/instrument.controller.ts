import { Request, Response } from 'express';
import { Instrument } from '@models';
import { handleCommonErrors } from '@utils';

export class InstrumentController {
  static async getInstruments(req: Request, res: Response) {
    try {
      const instruments = await Instrument.find();
      res.json(instruments);
    } catch (error: unknown) {
      handleCommonErrors(error, res, 'Get Instruments');
    }
  }
}
