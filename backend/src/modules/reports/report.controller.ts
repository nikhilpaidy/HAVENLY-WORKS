import { Request, Response, NextFunction } from 'express';
import {
  getSuperAdminDashboardStats,
  getCoworkingAdminDashboardStats,
  getCompanyUsageStats
} from './report.service.js';
import { apiSuccess } from '../../utils/response.js';
import { AppError } from '../../middleware/errorHandler.js';
import { UserRole } from '../../types/index.js';

export async function getSuperAdminStatsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await getSuperAdminDashboardStats();
    return apiSuccess(res, stats);
  } catch (error) {
    next(error);
  }
}

export async function getAdminStatsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const orgId = req.user?.organizationId || (req.query.organizationId as string);
    if (!orgId) {
      throw new AppError('organizationId is required', 400);
    }

    const stats = await getCoworkingAdminDashboardStats(orgId);
    return apiSuccess(res, stats);
  } catch (error) {
    next(error);
  }
}

export async function getCompanyStatsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const companyId = req.user?.companyId || (req.query.companyId as string);
    if (!companyId) {
      throw new AppError('companyId is required', 400);
    }

    const stats = await getCompanyUsageStats(companyId);
    return apiSuccess(res, stats);
  } catch (error) {
    next(error);
  }
}
