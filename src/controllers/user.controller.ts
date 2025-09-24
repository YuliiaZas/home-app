import { Request, Response } from 'express';
import { User } from '@models';
import { handleCommonErrors, logAndRespond, signAccessToken } from '@utils';
import { DashboardService } from '@services';

export class UserController {
  static async registerUser(req: Request, res: Response) {
    try {
      const { userName, password, fullName } = req.body;

      const newUser = await User.create({ userName, password, fullName });
  
      await DashboardService.addDefaultDashboards(newUser._id);
  
      const token = signAccessToken(newUser);
      res.json({ token });
    } catch (error: unknown) {
      handleCommonErrors(error, res, 'Login');
    }
  }

  static async loginUser(req: Request, res: Response) {
    try {
      const { userName, password } = req.body;
  
      const user = await User.findByName(userName);
      if (!user) return logAndRespond.authError(res, 'Login');
  
      const ok = await user.comparePassword(password);
      if (!ok) return logAndRespond.authError(res, 'Login');
  
      const token = signAccessToken(user);
      res.json({ token });
    } catch (error: unknown) {
      handleCommonErrors(error, res, 'Login');
    }
  }

  static async getProfile(req: Request, res: Response) {
    try {
      const user = await User.findById(req.user.id).select('-passwordHash -tokenVersion');
      res.json(user);
    } catch (error: unknown) {
      handleCommonErrors(error, res, 'Get Profile');
    }
  }
}
