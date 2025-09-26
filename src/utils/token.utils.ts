import jwt from 'jsonwebtoken';
import { IUser } from '@models';

export interface IJwtPayload {
  sub: string;
  v: number;
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_TTL = '1h';

export function signAccessToken(user: IUser): string {
  const payload: IJwtPayload = { sub: user._id, v: user.tokenVersion };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_TTL });
}

export function verifyAccessToken(token: string): jwt.JwtPayload | string {
  return jwt.verify(token, JWT_SECRET);
}
