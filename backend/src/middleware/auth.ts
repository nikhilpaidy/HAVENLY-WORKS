import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from './errorHandler.js';
import { JwtPayload, UserRole } from '../types/index.js';
import { User } from '../modules/users/user.model.js';

export async function authenticateJwt(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.headers.cookie) {
      
      const cookies = req.headers.cookie.split(';').reduce((acc, c) => {
        const [k, v] = c.trim().split('=');
        if (k && v) acc[k] = decodeURIComponent(v);
        return acc;
      }, {} as Record<string, string>);
      token = cookies.accessToken;
    }

    if (!token) {
      throw new AppError('Authentication required. No token provided.', 401);
    }

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;

    const user = await User.findById(decoded.userId).select('isActive role organizationId companyId email permissions');
    if (!user || !user.isActive) {
      throw new AppError('User account is deactivated or not found.', 401);
    }

    req.user = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role as UserRole,
      organizationId: user.organizationId?.toString(),
      companyId: user.companyId?.toString(),
      permissions: user.permissions || []
    };

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      next(new AppError('Token has expired', 401));
    } else if (error.name === 'JsonWebTokenError') {
      next(new AppError('Invalid token signature', 401));
    } else {
      next(error);
    }
  }
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError('Forbidden: You do not have permission to access this resource', 403)
      );
    }

    next();
  };
}

export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (
      req.user.role === UserRole.SUPER_ADMIN ||
      req.user.role === UserRole.COWORKING_ADMIN ||
      req.user.role === UserRole.COMPANY_OWNER
    ) {
      return next();
    }

    if (req.user.permissions?.includes(permission)) {
      return next();
    }

    return next(new AppError(`Forbidden: Missing required permission [${permission}]`, 403));
  };
}

export function requireTenant(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  if (req.user.role === UserRole.SUPER_ADMIN) {
    return next();
  }

  if (!req.user.organizationId) {
    return next(new AppError('No organization associated with this account', 403));
  }

  next();
}
