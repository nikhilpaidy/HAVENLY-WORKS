import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger.js';
import { apiError } from '../utils/response.js';

export class AppError extends Error {
  public statusCode: number;
  public errors?: any;

  constructor(message: string, statusCode = 400, errors?: any) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  
  next: NextFunction
): Response {
  logger.error(`[${req.method}] ${req.originalUrl} - Error: ${err.message}`, {
    stack: err.stack,
    body: req.body,
    query: req.query,
    params: req.params
  });

  if (err instanceof AppError) {
    return apiError(res, err.message, err.statusCode, err.errors);
  }

  if (err instanceof ZodError) {
    const formatted = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message
    }));
    return apiError(res, 'Validation error', 422, formatted);
  }

  if (
    err.code === 11000 ||
    err.name === 'MongoBulkWriteError' ||
    err.message?.includes('WriteConflict') ||
    err.message?.includes('multi-document transaction')
  ) {
    const field = Object.keys(err.keyPattern || {})[0] || 'resource';
    return apiError(res, `Booking conflict: The requested inventory slot is locked or already reserved.`, 409, {
      field,
      value: err.keyValue
    });
  }

  if (err.name === 'CastError') {
    return apiError(res, `Invalid ID format for ${err.path}`, 400);
  }

  if (err.name === 'JsonWebTokenError') {
    return apiError(res, 'Invalid authentication token', 401);
  }
  if (err.name === 'TokenExpiredError') {
    return apiError(res, 'Authentication token has expired', 401);
  }

  return apiError(res, 'Internal server error', 500);
}
