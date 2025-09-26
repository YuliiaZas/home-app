import jwt from 'jsonwebtoken';
import { IJwtPayload } from '@utils';

export function isPayload(obj: jwt.JwtPayload | string): obj is IJwtPayload {
  return typeof obj === 'object' && obj !== null && typeof obj.sub === 'string' && typeof obj.v === 'number';
}
