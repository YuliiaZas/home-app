import { Response } from 'express';
import { MongoError } from 'mongodb';

export class AppError extends Error {
  constructor(public message: string, public statusCode: number = 401) {
    super(message);
    this.name = 'AppError';
  }
}

export class AppValidationError extends Error {
  constructor(public message: string) {
    super(message);
    this.name = 'AppValidationError';
  }
}

// export const handleAsyncError = (fn: Function) => {
//   return (req: any, res: Response, next: Function) => {
//     Promise.resolve(fn(req, res, next)).catch(next);
//   };
// };

export const logAndRespond = {
  validationError: (res: Response, error: any, context: string) => {
    console.error(`${context} validation error:`, error.message);
    const messages = Object.values(error.errors).map((err: any) => err.message);
    return res.status(400).json({ error: messages.join(', ') });
  },

  duplicateError: (res: Response, context: string, field = 'Username') => {
    console.error(`${context} duplicate key error`);
    return res.status(409).json({ error: `${field} already taken` });
  },

  authError: (res: Response, context: string) => {
    console.error(`${context} authentication error`);
    return res.status(401).json({ error: 'Invalid credentials' });
  },

  serverError: (res: Response, error: any, context: string) => {
    console.error(`${context} error:`, error);
    return res.status(500).json({ error: 'Internal server error' });
  },

  customError: (res: Response, error: AppError, context: string) => {
    console.error(`${context} error:`, error.message);
    return res.status(error.statusCode).json({ error: error.message });
  }
};

export const handleCommonErrors = (error: unknown, res: Response, context: string) => {
  if (error instanceof AppError) {
    return logAndRespond.customError(res, error, context);
  }

  if (error instanceof MongoError && error.code === 11000) {
    return logAndRespond.duplicateError(res, context);
  }

  if ((error instanceof MongoError && error.name === 'ValidationError') || error instanceof AppValidationError) {
    return logAndRespond.validationError(res, error, context);
  }

  return logAndRespond.serverError(res, error, context);
};