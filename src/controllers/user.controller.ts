import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { User } from '@models';
import { signAccessToken } from '@utils';
import { DashboardService } from '@services';

export class UserController {
  static async registerUser(req: Request, res: Response) {
    const { userName, password, fullName } = req.body;
    if (!userName || !password) return res.status(400).send('Missing username or password');

    const exists = await User.findOne({
      userName: new RegExp(`^${userName}$`, 'i'),
    });
    if (exists) return res.status(409).send('User already exists');

    const hash = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      userName,
      passwordHash: hash,
      fullName: fullName || userName,
      tokenVersion: 1,
    });

    await DashboardService.addDefaultDashboards(newUser._id);

    const token = signAccessToken(newUser);
    res.json({ token });
  }

  static async loginUser(req: Request, res: Response) {
    const { userName, password } = req.body;
    const user = await User.findOne({
      userName: new RegExp(`^${userName}$`, 'i'),
    });
    if (!user) return res.status(401).send('Wrong username or password');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).send('Wrong username or password');

    const token = signAccessToken(user);
    res.json({ token });
  }

  static async getProfile(req: Request, res: Response) {
    const user = await User.findById(req.user.id).select('-passwordHash -tokenVersion');
    if (!user) return res.status(401).send('Unauthorized');
    res.json(user);
  }
}
