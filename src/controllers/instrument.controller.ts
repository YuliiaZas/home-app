import { Request, Response } from 'express';
import { DIContainer, SERVICE_TOKENS } from '@di';
import { type IInstrumentService } from '@interfaces';
import { handleCommonErrors } from '@utils';

export class InstrumentController {
  private instrumentService: IInstrumentService;

  constructor() {
    this.instrumentService = DIContainer.resolve<IInstrumentService>(SERVICE_TOKENS.Instrument);
  }

  async getInstruments(req: Request, res: Response) {
    try {
      res.json(await this.instrumentService.getInstruments());
    } catch (error: unknown) {
      handleCommonErrors(error, res, 'Get Instruments');
    }
  }
}
