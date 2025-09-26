import { NextFunction, Request, Response } from 'express';
import { User } from '@models';
import { AppAuthError, handleCommonErrors, isPayload, verifyAccessToken } from '@utils';

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authorizationHeader = req.header('Authorization')?.split(' ');
    const authorizationMethod = authorizationHeader?.[0];
    const token = authorizationHeader?.[1];
    
    if (!token || authorizationMethod !== 'Bearer') {
      throw new AppAuthError('Unauthorized');
    }
    
    const payload = verifyAccessToken(token);
    if (!isPayload(payload)) throw new AppAuthError('Invalid token payload');

    const user = await User.findById(payload.sub);

    if (!user || user.tokenVersion !== payload.v) throw new AppAuthError('Invalid token');

    req.user = { id: user._id, userName: user.userName };
    next();
  } catch (error: unknown) {
    handleCommonErrors(error, res, 'Authorization');
  }
};
