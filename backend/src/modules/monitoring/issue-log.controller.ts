import { Request, Response, NextFunction } from 'express';
import { IssueLog } from './issue-log.model.js';
import { apiSuccess } from '../../utils/response.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function getIssueLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
    const skip = (page - 1) * limit;

    const query: any = {};

    if (req.query.level) {
      query.level = req.query.level;
    }

    if (req.query.statusCode) {
      query.statusCode = parseInt(req.query.statusCode as string, 10);
    }

    if (req.query.resolved !== undefined && req.query.resolved !== '') {
      query.resolved = req.query.resolved === 'true';
    }

    if (req.query.search) {
      const s = String(req.query.search).trim();
      query.$or = [
        { message: { $regex: s, $options: 'i' } },
        { path: { $regex: s, $options: 'i' } },
        { userEmail: { $regex: s, $options: 'i' } }
      ];
    }

    const [logs, total] = await Promise.all([
      IssueLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      IssueLog.countDocuments(query)
    ]);

    return apiSuccess(res, {
      logs,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
}

export async function getMonitoringStats(req: Request, res: Response, next: NextFunction) {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [
      totalIssues,
      unresolvedCount,
      recentErrors,
      recentWarnings,
      errorCountTotal,
      warnCountTotal
    ] = await Promise.all([
      IssueLog.countDocuments(),
      IssueLog.countDocuments({ resolved: false }),
      IssueLog.countDocuments({ level: 'ERROR', createdAt: { $gte: oneDayAgo } }),
      IssueLog.countDocuments({ level: 'WARN', createdAt: { $gte: oneDayAgo } }),
      IssueLog.countDocuments({ level: 'ERROR' }),
      IssueLog.countDocuments({ level: 'WARN' })
    ]);

    const mem = process.memoryUsage();
    const uptimeSec = Math.floor(process.uptime());

    const systemStatus = recentErrors > 5 ? 'DEGRADED' : (recentErrors > 0 ? 'ATTENTION_REQUIRED' : 'HEALTHY');

    return apiSuccess(res, {
      status: systemStatus,
      uptimeSeconds: uptimeSec,
      totalIssues,
      unresolvedCount,
      recent24hErrors: recentErrors,
      recent24hWarnings: recentWarnings,
      totalErrors: errorCountTotal,
      totalWarnings: warnCountTotal,
      database: 'CONNECTED',
      memory: {
        rssMb: Math.round(mem.rss / 1024 / 1024),
        heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
        heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024)
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function resolveIssueLog(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const log = await IssueLog.findById(id);
    if (!log) {
      throw new AppError('Issue log entry not found', 404);
    }

    log.resolved = true;
    log.resolvedAt = new Date();
    log.resolvedBy = req.user?.email || 'Super Admin';
    await log.save();

    return apiSuccess(res, log);
  } catch (error) {
    next(error);
  }
}

export async function clearAllIssueLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const { olderThanDays } = req.query;
    let query: any = {};
    if (olderThanDays) {
      const days = parseInt(olderThanDays as string, 10);
      if (!isNaN(days) && days > 0) {
        query.createdAt = { $lt: new Date(Date.now() - days * 24 * 60 * 60 * 1000) };
      }
    }

    const result = await IssueLog.deleteMany(query);
    return apiSuccess(res, { deletedCount: result.deletedCount });
  } catch (error) {
    next(error);
  }
}