import { NextFunction, Request, Response } from 'express';
import { User } from '@models';
import { AppError, handleCommonErrors, isPayload, verifyAccessToken } from '@utils';

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authorizationHeader = req.header('Authorization')?.split(' ');
    const authorizationMethod = authorizationHeader?.[0];
    const token = authorizationHeader?.[1];
    
    if (!token || authorizationMethod !== 'Bearer') {
      throw new AppError('Unauthorized', 401);
    }
    
    const payload = verifyAccessToken(token);
    if (!isPayload(payload)) throw new AppError('Invalid token payload', 401);

    const user = await User.findById(payload.sub);

    if (!user || user.tokenVersion !== payload.v) throw new AppError('Invalid token', 401);

    req.user = { id: user.id, userName: user.userName };
    next();
  } catch (error: unknown) {
    handleCommonErrors(error, res, 'Authorization');
  }
};
