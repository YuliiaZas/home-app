import { Request, Response } from 'express';
import { UserInstrument } from '@models';
import { AppError, handleCommonErrors } from '@utils';

export class UserInstrumentController {
  static async updateInstrumentState(req: Request, res: Response) {
    try {
      const { instrumentId } = req.params;
      const { state } = req.body;
  
      const userInstrument = await UserInstrument.findOne({
        userId: req.user.id,
        instrumentId,
      });
      if (!userInstrument) throw new AppError("User instrument not found", 404);
  
      userInstrument.state = state;
      await userInstrument.save();
  
      res.status(200).json(userInstrument);
    } catch (error: unknown) {
      handleCommonErrors(error, res, 'Update Instrument State');
    }
  }

  static async getUserInstruments(req: Request, res: Response) {
    try {
      const userInstruments = await UserInstrument.find({ userId: req.user.id });
      res.json(userInstruments);
    } catch (error: unknown) {
      handleCommonErrors(error, res, 'Get User Instruments');
    }
  }
}
