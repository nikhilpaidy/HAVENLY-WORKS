import { Request, Response, NextFunction } from 'express';
import { loginUser, refreshAccessToken, logoutUser } from './auth.service.js';
import { apiSuccess } from '../../utils/response.js';
import { User } from '../users/user.model.js';
import { CoworkingOrganization } from '../organizations/organization.model.js';
import { Company } from '../companies/company.model.js';
import bcrypt from 'bcryptjs';
import { AppError } from '../../middleware/errorHandler.js';
import { UserRole } from '../../types/index.js';

export async function loginHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, expectedRole } = req.body;
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip;

    const result = await loginUser(email, password, expectedRole, userAgent, ipAddress);

    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000 
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 
    });

    return apiSuccess(res, result, 'Login successful');
  } catch (error) {
    next(error);
  }
}

export async function refreshHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new AppError('Refresh token required', 400);
    }

    const result = await refreshAccessToken(refreshToken);

    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return apiSuccess(res, result, 'Tokens refreshed');
  } catch (error) {
    next(error);
  }
}

export async function logoutHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
    if (refreshToken) {
      await logoutUser(refreshToken);
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return apiSuccess(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
}

export async function meHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await User.findById(req.user?.userId).select('-passwordHash');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    let organization = null;
    if (user.organizationId) {
      organization = await CoworkingOrganization.findById(user.organizationId);
    }

    let company = null;
    if (user.companyId) {
      company = await Company.findById(user.companyId);
    }

    const userObj = {
      id: user._id.toString(),
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      designation: user.designation,
      permissions: user.permissions || [],
      organizationId: user.organizationId?.toString(),
      companyId: user.companyId?.toString(),
      organization,
      company,
      avatarUrl: user.avatarUrl,
      favoriteRoomIds: (user.favoriteRoomIds || []).map((id) => id.toString()),
      isActive: user.isActive
    };

    return apiSuccess(res, {
      ...userObj,
      user: userObj,
      organization,
      company
    }, 'Current user profile');
  } catch (error) {
    next(error);
  }
}

export async function updateProfileHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const { name, phone, designation, avatarUrl } = req.body;

    const isRestrictedStaff =
      user.role === UserRole.COMPANY_STAFF ||
      user.role === UserRole.COWORKING_ADMIN_STAFF;

    if (isRestrictedStaff) {
      if ((name !== undefined && name !== user.name) || (phone !== undefined && phone !== user.phone)) {
        throw new AppError('Enterprise staff accounts are managed by your administrator. You can only update your profile picture.', 403);
      }
      if (avatarUrl !== undefined) {
        user.avatarUrl = avatarUrl;
      }
    } else {
      if (name !== undefined) user.name = name.trim();
      if (phone !== undefined) user.phone = phone.trim();
      if (designation !== undefined) user.designation = designation.trim();
      if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    }

    await user.save();

    const updatedUser = {
      id: user._id.toString(),
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      designation: user.designation,
      permissions: user.permissions || [],
      avatarUrl: user.avatarUrl,
      favoriteRoomIds: (user.favoriteRoomIds || []).map((id) => id.toString()),
      isActive: user.isActive
    };

    return apiSuccess(res, updatedUser, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteAccountHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.isActive = false;
    await user.save();

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return apiSuccess(res, null, 'Account has been deactivated successfully');
  } catch (error) {
    next(error);
  }
}

export async function changePasswordHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user?.userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return apiSuccess(res, null, 'Password updated successfully');
  } catch (error) {
    next(error);
  }
}
