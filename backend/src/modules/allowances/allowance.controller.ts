import { Request, Response, NextFunction } from 'express';
import {
  getOrCreateCurrentAllowance,
  calculateEntitlement,
  adjustAllowance
} from './allowance.service.js';
import { AllowancePeriod, AllowanceLedgerEntry } from './allowance.model.js';
import { Company } from '../companies/company.model.js';
import { apiSuccess } from '../../utils/response.js';
import { AppError } from '../../middleware/errorHandler.js';
import { UserRole } from '../../types/index.js';
import { createAuditLog } from '../audit-logs/audit-log.service.js';

export async function getCurrentAllowance(req: Request, res: Response, next: NextFunction) {
  try {
    let companyId =
      req.user?.role === UserRole.SUPER_ADMIN || req.user?.role === UserRole.COWORKING_ADMIN
        ? (req.query.companyId as string) || req.user?.companyId
        : req.user?.companyId;

    if (!companyId && (req.user?.role === UserRole.SUPER_ADMIN || req.user?.role === UserRole.COWORKING_ADMIN)) {
      const companyFilter = req.user?.organizationId ? { organizationId: req.user.organizationId } : {};
      const firstComp = await Company.findOne(companyFilter);
      if (firstComp) {
        companyId = firstComp._id.toString();
      }
    }

    if (!companyId) {
      return apiSuccess(res, {
        totalGrantedHours: 0,
        consumedHours: 0,
        reservedHours: 0,
        availableHours: 0,
        periodYear: new Date().getFullYear(),
        periodMonth: new Date().getMonth() + 1
      });
    }

    const allowance = await getOrCreateCurrentAllowance(companyId);
    const allowanceObj = typeof (allowance as any).toObject === 'function' ? (allowance as any).toObject() : allowance;
    return apiSuccess(res, {
      ...allowanceObj,
      totalGrantedHours: allowanceObj.grantedHours,
      availableHours: allowanceObj.balanceHours
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllowanceHistory(req: Request, res: Response, next: NextFunction) {
  try {
    let companyId =
      req.user?.role === UserRole.SUPER_ADMIN || req.user?.role === UserRole.COWORKING_ADMIN
        ? (req.query.companyId as string) || req.user?.companyId
        : req.user?.companyId;

    if (!companyId && (req.user?.role === UserRole.SUPER_ADMIN || req.user?.role === UserRole.COWORKING_ADMIN)) {
      const companyFilter = req.user?.organizationId ? { organizationId: req.user.organizationId } : {};
      const firstComp = await Company.findOne(companyFilter);
      if (firstComp) {
        companyId = firstComp._id.toString();
      }
    }

    if (!companyId) {
      return apiSuccess(res, {
        periods: [],
        ledger: []
      });
    }

    const periods = await AllowancePeriod.find({ companyId }).sort({
      periodYear: -1,
      periodMonth: -1
    });

    const ledger = await AllowanceLedgerEntry.find({ companyId })
      .populate('bookingId', 'bookingNumber startTime endTime')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);

    return apiSuccess(res, {
      periods,
      ledger
    });
  } catch (error) {
    next(error);
  }
}

export async function estimateBookingAllowance(req: Request, res: Response, next: NextFunction) {
  try {
    let companyId = req.user?.companyId || (req.body.companyId as string) || (req.query.companyId as string);
    const { durationHours, startTime } = req.body;

    if (!companyId && (req.user?.role === UserRole.SUPER_ADMIN || req.user?.role === UserRole.COWORKING_ADMIN)) {
      const companyFilter = req.user?.organizationId ? { organizationId: req.user.organizationId } : {};
      const fallbackCompany = await Company.findOne(companyFilter);
      if (fallbackCompany) {
        companyId = fallbackCompany._id.toString();
      }
    }

    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }
    if (!durationHours) {
      throw new AppError('durationHours is required', 400);
    }

    const result = await calculateEntitlement(
      companyId,
      parseFloat(durationHours),
      startTime ? new Date(startTime) : new Date()
    );

    return apiSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function adjustAllowanceHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId, hours, notes } = req.body;
    if (!companyId || hours === undefined || !notes) {
      throw new AppError('companyId, hours, and notes are required', 400);
    }

    const result = await adjustAllowance(companyId, parseFloat(hours), notes, req.user!.userId);

    await createAuditLog({
      organizationId: req.user?.organizationId,
      userId: req.user!.userId,
      userEmail: req.user!.email,
      userRole: req.user!.role,
      action: 'ALLOWANCE_ADJUSTED',
      entityType: 'AllowancePeriod',
      entityId: result.allowance._id.toString(),
      details: { companyId, hours, notes }
    });

    return apiSuccess(res, result, 'Allowance adjusted successfully');
  } catch (error) {
    next(error);
  }
}
