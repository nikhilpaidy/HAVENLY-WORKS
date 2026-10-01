import { Request, Response, NextFunction } from 'express';
import { createAtomicBooking, cancelBooking, checkInBooking } from './booking.service.js';
import { Booking } from './booking.model.js';
import { Company } from '../companies/company.model.js';
import { apiSuccess } from '../../utils/response.js';
import { AppError } from '../../middleware/errorHandler.js';
import { BookingStatus, UserRole } from '../../types/index.js';

export async function createBookingHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      roomId,
      companyId: reqCompanyId,
      title,
      purpose,
      attendeeCount,
      startTime,
      endTime
    } = req.body;

    let targetCompanyId = req.user?.companyId;
    if (
      (req.user?.role === UserRole.SUPER_ADMIN || req.user?.role === UserRole.COWORKING_ADMIN) &&
      reqCompanyId
    ) {
      targetCompanyId = reqCompanyId;
    }

    if (
      !targetCompanyId &&
      (req.user?.role === UserRole.SUPER_ADMIN || req.user?.role === UserRole.COWORKING_ADMIN)
    ) {
      const companyFilter = req.user?.organizationId ? { organizationId: req.user.organizationId } : {};
      const fallbackCompany = await Company.findOne(companyFilter);
      if (fallbackCompany) {
        targetCompanyId = fallbackCompany._id.toString();
      }
    }

    if (!targetCompanyId) {
      throw new AppError('companyId is required to make a booking', 400);
    }
    if (!roomId || !title || !attendeeCount || !startTime || !endTime) {
      throw new AppError(
        'roomId, title, attendeeCount, startTime, and endTime are required',
        400
      );
    }

    const booking = await createAtomicBooking({
      roomId,
      companyId: targetCompanyId,
      bookedByUserId: req.user!.userId,
      title,
      purpose,
      attendeeCount: parseInt(attendeeCount, 10),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return apiSuccess(res, booking, 'Booking confirmed successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function getBookingsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    let query: any = {};

    if (req.user?.role === UserRole.SUPER_ADMIN) {
      if (req.query.organizationId) query.organizationId = req.query.organizationId;
    } else if (req.user?.role === UserRole.COWORKING_ADMIN) {
      query.organizationId = req.user.organizationId;
    } else {
      
      query.companyId = req.user?.companyId;

      if (req.user?.role === UserRole.EMPLOYEE) {
        query.bookedByUserId = req.user.userId;
      }
    }

    if (req.query.myOnly === 'true' || req.query.userOnly === 'true') {
      query.bookedByUserId = req.user?.userId;
    }
    if (req.query.roomId) query.roomId = req.query.roomId;
    if (req.query.companyId && req.user?.role !== UserRole.EMPLOYEE) {
      query.companyId = req.query.companyId;
    }
    if (req.query.status) query.status = req.query.status;

    if (req.query.startDate && req.query.endDate) {
      query.startTime = {
        $gte: new Date(req.query.startDate as string),
        $lte: new Date(req.query.endDate as string)
      };
    } else if (req.query.date) {
      const d = req.query.date as string;
      const startOfDay = new Date(`${d}T00:00:00.000Z`);
      const endOfDay = new Date(`${d}T23:59:59.999Z`);
      query.startTime = { $gte: startOfDay, $lte: endOfDay };
    }

    if (req.query.scope === 'upcoming') {
      query.startTime = { $gte: new Date() };
      query.status = { $in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] };
    } else if (req.query.scope === 'past') {
      query.startTime = { $lt: new Date() };
    }

    const bookings = await Booking.find(query)
      .populate('roomId', 'name code capacity hourlyRate photos amenities')
      .populate('locationId', 'name city timezone')
      .populate('companyId', 'name')
      .populate('bookedByUserId', 'name email')
      .sort({ startTime: -1 })
      .limit(100);

    return apiSuccess(res, bookings);
  } catch (error) {
    next(error);
  }
}

export async function getBookingByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id)
      .populate('roomId')
      .populate('locationId')
      .populate('companyId')
      .populate('bookedByUserId', 'name email');

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    if (
      req.user?.role !== UserRole.SUPER_ADMIN &&
      booking.organizationId.toString() !== req.user?.organizationId
    ) {
      throw new AppError('Unauthorized access to this booking', 403);
    }
    if (
      req.user?.role !== UserRole.SUPER_ADMIN &&
      req.user?.role !== UserRole.COWORKING_ADMIN &&
      booking.companyId.toString() !== req.user?.companyId
    ) {
      throw new AppError('Unauthorized access to this booking', 403);
    }

    return apiSuccess(res, booking);
  } catch (error) {
    next(error);
  }
}

export async function cancelBookingHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const { reason } = req.body;

    const result = await cancelBooking({
      bookingId: id,
      userId: req.user!.userId,
      userRole: req.user!.role,
      userCompanyId: req.user?.companyId,
      reason,
      ipAddress: req.ip
    });

    return apiSuccess(res, result, 'Booking cancelled successfully');
  } catch (error) {
    next(error);
  }
}

export async function checkInBookingHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const result = await checkInBooking(id, req.user!.userId);
    return apiSuccess(res, result, 'Checked in successfully');
  } catch (error) {
    next(error);
  }
}
