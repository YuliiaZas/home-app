import { Request } from 'express';
import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user: AuthenticatedUser;
  }
}

export type TypedRequest<TParams = object, TBody = object, TQuery = object> = Request<TParams, unknown, TBody, TQuery>;

export interface AuthenticatedUser {
  id: string;
  userName: string;
}

export interface AuthenticatedRequest<TParams = object, TBody = object, TQuery = object>
  extends TypedRequest<TParams, TBody, TQuery> {
  user: AuthenticatedUser;
}
