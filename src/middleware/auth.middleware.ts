import { NextFunction, Request, Response } from 'express';
import { User } from '@models';
import { isPayload, verifyAccessToken } from '@utils';

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authorizationHeader = req.header('Authorization')?.split(' ');
  const authorizationMethod = authorizationHeader?.[0];
  const token = authorizationHeader?.[1];

  if (!token || authorizationMethod !== 'Bearer') {
    return res.status(401).send('Unauthorized');
  }

  try {
    const payload = verifyAccessToken(token);
    if (!isPayload(payload)) throw new Error('Invalid token payload');

    const user = await User.findById(payload.sub);

    if (!user || user.tokenVersion !== payload.v) throw new Error('Invalid token');

    req.user = { id: user.id, userName: user.userName };
    next();
  } catch (e) {
    console.log(e);
    return res.status(401).json({ error: 'Invalid token' });
  }
};
