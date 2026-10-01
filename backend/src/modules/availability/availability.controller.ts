import { Request, Response, NextFunction } from 'express';
import { getRoomAvailabilityForDate } from './availability.service.js';
import { apiSuccess } from '../../utils/response.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function getAvailabilityHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const roomId = req.params.roomId as string;
    const dateStr = (req.query.date as string) || new Date().toISOString().split('T')[0];

    if (!roomId) {
      throw new AppError('roomId is required', 400);
    }

    const result = await getRoomAvailabilityForDate(roomId, dateStr);
    return apiSuccess(res, result);
  } catch (error) {
    next(error);
  }
}
