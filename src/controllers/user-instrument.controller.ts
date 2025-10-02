import { Request, Response } from 'express';
import { DIContainer, SERVICE_TOKENS } from '@di';
import { type IUserInstrumentService } from '@interfaces';
import { handleCommonErrors } from '@utils';

export class UserInstrumentController {  
  private userInstrumentService: IUserInstrumentService;

  constructor() {
    this.userInstrumentService = DIContainer.resolve<IUserInstrumentService>(SERVICE_TOKENS.UserInstrument);
  }

  async updateInstrumentState(req: Request, res: Response) {
    try {
      const { instrumentId } = req.params;
      const { state } = req.body;

      res.status(200).json(await this.userInstrumentService.updateUserInstrumentState({
        userId: req.user.id,
        instrumentId,
        state,
      }));
    } catch (error: unknown) {
      handleCommonErrors(error, res, 'Update Instrument State');
    }
  }

  async getUserInstruments(req: Request, res: Response) {
    try {
      res.status(200).json(await this.userInstrumentService.getUserInstruments(req.user.id));
    } catch (error: unknown) {
      handleCommonErrors(error, res, 'Get User Instruments');
    }
  }
}
