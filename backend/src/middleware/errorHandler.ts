import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger.js';
import { apiError } from '../utils/response.js';
import { IssueLog } from '../modules/monitoring/issue-log.model.js';

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

  let finalStatusCode = 500;
  let finalMessage = 'An unexpected server error occurred.';
  let finalDetails: any = undefined;

  if (err instanceof AppError) {
    finalStatusCode = err.statusCode;
    finalMessage = err.message;
    finalDetails = err.errors;
  } else if (err instanceof ZodError) {
    finalStatusCode = 422;
    finalDetails = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message
    }));
    finalMessage = `Validation failed: ${err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`;
  } else if (err.name === 'ValidationError') {
    finalStatusCode = 400;
    const msgs = Object.values(err.errors || {}).map((e: any) => e.message || `${e.path} is invalid`);
    finalMessage = `Database validation failed: ${msgs.join(', ')}`;
    finalDetails = err.errors;
  } else if (
    err.code === 11000 ||
    err.name === 'MongoBulkWriteError' ||
    err.message?.includes('WriteConflict') ||
    err.message?.includes('multi-document transaction')
  ) {
    finalStatusCode = 409;
    const field = Object.keys(err.keyPattern || {})[0] || 'resource';
    finalMessage = `Booking conflict or duplicate entry: The requested ${field} is already locked or in use.`;
    finalDetails = { field, value: err.keyValue };
  } else if (err.name === 'CastError') {
    finalStatusCode = 400;
    finalMessage = `Invalid identifier format: ${err.value} is not a valid ${err.path}`;
  } else if (err.name === 'JsonWebTokenError') {
    finalStatusCode = 401;
    finalMessage = 'Invalid authentication token. Please sign in again.';
  } else if (err.name === 'TokenExpiredError') {
    finalStatusCode = 401;
    finalMessage = 'Your session has expired. Please sign in again.';
  } else if (err.statusCode && typeof err.statusCode === 'number') {
    finalStatusCode = err.statusCode;
    finalMessage = err.message || finalMessage;
  } else if (err.message) {
    finalMessage = err.message;
  }

  IssueLog.create({
    level: finalStatusCode >= 500 ? 'ERROR' : 'WARN',
    method: req.method,
    path: req.originalUrl,
    statusCode: finalStatusCode,
    message: finalMessage,
    stack: err.stack,
    userEmail: (req as any).user?.email,
    userId: (req as any).user?.userId || (req as any).user?._id,
    userRole: (req as any).user?.role,
    ip: req.ip || req.socket.remoteAddress,
    userAgent: req.get('user-agent'),
    resolved: false
  }).catch(() => {});

  return apiError(res, finalMessage, finalStatusCode, finalDetails);
}