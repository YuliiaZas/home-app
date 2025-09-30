import { Request, Response } from 'express';
import { User } from '@models';
import { AppAuthError, handleCommonErrors, signAccessToken } from '@utils';
import { DashboardService } from '@services';

export class UserController {
  static async registerUser(req: Request, res: Response) {
    try {
      const { userName, password, fullName } = req.body;

      const newUser = await User.create({ userName, password, fullName });
      const token = signAccessToken(newUser);

      let dashboardsCreation: { created: string[]; skipped: string[]; failed: string[]; errors: string[] } = {
        created: [],
        skipped: [],
        failed: [],
        errors: ['Dashboard creation timeout']
      };

      await Promise.race([
        DashboardService.addDefaultDashboards(newUser._id).then((dashboardsCreationResult) => {
          dashboardsCreation = dashboardsCreationResult;
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Dashboard creation timeout')), 5000)),
      ]);

      res.status(200).json({ token, dashboardsCreation });
    } catch (error: unknown) {
      handleCommonErrors(error, res, 'Registration');
    }
  }

  static async loginUser(req: Request, res: Response) {
    try {
      const { userName, password } = req.body;

      const user = await User.authenticate(userName, password);
      if (!user) throw new AppAuthError('Invalid credentials');

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
