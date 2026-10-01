import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { apiSuccess } from '../../utils/response.js';
import { env } from '../../config/env.js';

export function getHealth(req: Request, res: Response) {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  return apiSuccess(res, {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: dbStatus,
    environment: env.NODE_ENV,
    version: '1.0.0'
  }, 'Health check passed');
}
