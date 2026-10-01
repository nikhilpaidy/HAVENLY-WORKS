/**
 * Emergency Override Controller.
 * Provides REST handlers for submitting urgent slot override requests,
 * viewing pending requests, and administrative approval/rejection.
 */

import { Request, Response, NextFunction } from 'express';
import {
  requestEmergencyOverride,
  getOverrideRequests,
  reviewEmergencyOverride
} from './override.service.js';
import { apiSuccess } from '../../utils/response.js';
import { AppError } from '../../middleware/errorHandler.js';
import { OverrideRequestStatus, UserRole } from '../../types/index.js';

export async function requestEmergencyOverrideHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user!;
    const { roomId, requestedStartTime, requestedEndTime, urgencyReason, attendeeCount } = req.body;

    if (!roomId || !requestedStartTime || !requestedEndTime || !urgencyReason) {
      throw new AppError(
        'roomId, requestedStartTime, requestedEndTime, and urgencyReason are required',
        400
      );
    }

    if (!user.organizationId || !user.companyId) {
      throw new AppError('User must belong to a company to request emergency overrides', 400);
    }

    const override = await requestEmergencyOverride({
      organizationId: user.organizationId,
      roomId,
      requestingCompanyId: user.companyId,
      requestingUserId: user.userId,
      requestedStartTime,
      requestedEndTime,
      urgencyReason,
      attendeeCount: attendeeCount ? Number(attendeeCount) : 4
    });

    return apiSuccess(res, override, 'Emergency override request submitted to facility management', 201);
  } catch (error) {
    next(error);
  }
}

export async function getOverrideRequestsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const filter: any = {};

    if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.SUPER_ADMIN_STAFF) {
      if (req.query.organizationId) {
        filter.organizationId = req.query.organizationId as string;
      }
    } else if (
      user.role === UserRole.COWORKING_ADMIN ||
      user.role === UserRole.COWORKING_ADMIN_STAFF
    ) {
      filter.organizationId = user.organizationId;
    } else {
      filter.requestingCompanyId = user.companyId;
    }

    if (req.query.status) {
      filter.status = req.query.status as OverrideRequestStatus;
    }

    const requests = await getOverrideRequests(filter);
    return apiSuccess(res, requests);
  } catch (error) {
    next(error);
  }
}

export async function reviewEmergencyOverrideHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const { status, adminReviewNotes } = req.body;
    const user = req.user!;

    if (!status || (status !== OverrideRequestStatus.APPROVED && status !== OverrideRequestStatus.REJECTED)) {
      throw new AppError('Valid status (APPROVED or REJECTED) is required', 400);
    }

    const override = await reviewEmergencyOverride(id as string, {
      status,
      adminReviewNotes,
      reviewedByUserId: user.userId
    });

    return apiSuccess(
      res,
      override,
      `Emergency override request ${status.toLowerCase()} successfully`
    );
  } catch (error) {
    next(error);
  }
}
