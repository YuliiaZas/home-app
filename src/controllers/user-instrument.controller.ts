import { Request, Response } from 'express';
import { UserInstrument } from '@models';

export class UserInstrumentController {
  static async updateInstrumentState(req: Request, res: Response) {
    const { instrumentId } = req.params;
    const { state } = req.body;
    if (typeof state !== 'boolean') return res.status(400).send("Missing or invalid 'state'");

    const userInstrument = await UserInstrument.findOne({
      userId: req.user.id,
      instrumentId,
    });
    if (!userInstrument) return res.status(404).send('Instrument not found among user instruments');

    userInstrument.state = state;
    await userInstrument.save();

    res.status(200).json(userInstrument);
  }

  static async getUserInstruments(req: Request, res: Response) {
    const userInstruments = await UserInstrument.find({ userId: req.user.id });
    res.json(userInstruments);
  }
}
