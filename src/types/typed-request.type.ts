import { Request } from 'express';

export type TypedRequest<TParams = object, TBody = object, TQuery = object> = Request<TParams, unknown, TBody, TQuery>;

export interface AuthenticatedUser {
  id: string;
  userName: string;
}

export interface AuthenticatedRequest<TParams = object, TBody = object, TQuery = object>
  extends TypedRequest<TParams, TBody, TQuery> {
  user: AuthenticatedUser;
}
