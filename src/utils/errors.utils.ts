import { Response } from 'express';
import { MongoError } from 'mongodb';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class AppAuthError extends AppError {
  constructor(
    public message = 'Invalid credentials',
    public statusCode = 401
  ) {
    super(message, statusCode);
    this.name = 'AppAuthError';
  }
}

export class AppNotFoundError extends AppError {
  constructor(
    public item = 'Item',
    public statusCode = 404
  ) {
    super(item, statusCode);
    this.name = 'AppNotFoundError';
    this.message = `${item} not found`;
  }
}

export class AppValidationError extends Error {
  constructor(public message: string) {
    super(message);
    this.name = 'AppValidationError';
  }
}

export const logAndRespond = {
  validationError: (res: Response, error: MongoError | AppValidationError, context: string) => {
    console.error(`${context} validation error:`, error.message);
    if (error.name === 'ValidationError' && 'errors' in error && error.errors) {
      const messages = Object.values(error.errors).map((err: Error) => err.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    return res.status(400).json({ error: error.message });
  },

  duplicateError: (res: Response, error: MongoError, context: string) => {
    console.error(`${context} duplicate key error`, error);
    return res.status(409).json({ error: error.message || 'Duplicate key error collection' });
  },

  authError: (res: Response, context: string, errorMessage?: string) => {
    console.error(`${context} authentication error`, errorMessage || '');
    return res.status(401).json({ error: errorMessage || 'Invalid credentials' });
  },

  serverError: (res: Response, error: unknown, context: string) => {
    console.error(`${context} error:`, error);
    return res.status(500).json({ error: 'Internal server error' });
  },

  customError: (res: Response, error: AppError, context: string) => {
    console.error(`${context} error:`, error.message);
    return res.status(error.statusCode).json({ error: error.message });
  },
};

export const handleCommonErrors = (error: unknown, res: Response, context: string) => {
  if (error instanceof AppError || error instanceof AppNotFoundError) {
    return logAndRespond.customError(res, error, context);
  }

  if (error instanceof MongoError && error.code === 11000) {
    return logAndRespond.duplicateError(res, error, context);
  }

  if ((error instanceof Error && error.name === 'ValidationError') || error instanceof AppValidationError) {
    return logAndRespond.validationError(res, error, context);
  }

  if (
    error instanceof AppAuthError ||
    (error instanceof Error && (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError'))
  ) {
    return logAndRespond.authError(res, context, error.message);
  }

  return logAndRespond.serverError(res, error, context);
};
