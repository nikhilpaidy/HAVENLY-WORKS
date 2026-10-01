import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: Record<string, any>;
  errors?: any;
}

export function apiSuccess<T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200,
  meta?: Record<string, any>
): Response {
  const responseBody: ApiResponse<T> = {
    success: true,
    message,
    data,
    meta
  };
  return res.status(statusCode).json(responseBody);
}

export function apiError(
  res: Response,
  message = 'Internal server error',
  statusCode = 500,
  errors?: any
): Response {
  const responseBody: ApiResponse = {
    success: false,
    message,
    errors
  };
  return res.status(statusCode).json(responseBody);
}
