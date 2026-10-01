import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User, IUser } from '../users/user.model.js';
import { RefreshToken } from './auth.model.js';
import { env } from '../../config/env.js';
import { AppError } from '../../middleware/errorHandler.js';
import { JwtPayload, UserRole } from '../../types/index.js';
import { CoworkingOrganization } from '../organizations/organization.model.js';
import { Company } from '../companies/company.model.js';

export function generateAccessToken(user: IUser): string {
  const payload: JwtPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role as UserRole,
    organizationId: user.organizationId?.toString(),
    companyId: user.companyId?.toString()
  };

  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as any
  });
}

export async function generateRefreshToken(
  user: IUser,
  userAgent?: string,
  ipAddress?: string
): Promise<string> {
  const rawToken = crypto.randomBytes(40).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); 

  await RefreshToken.create({
    userId: user._id,
    tokenHash,
    expiresAt,
    userAgent,
    ipAddress
  });

  return rawToken;
}

export async function loginUser(
  email: string,
  passwordPlain: string,
  expectedRole?: UserRole,
  userAgent?: string,
  ipAddress?: string
) {
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw new AppError('Account is deactivated. Please contact your administrator.', 403);
  }

  const isPasswordValid = await bcrypt.compare(passwordPlain, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  if (expectedRole) {
    if (expectedRole === UserRole.SUPER_ADMIN && user.role !== UserRole.SUPER_ADMIN) {
      throw new AppError('Unauthorized portal access for this account', 403);
    }
    if (expectedRole === UserRole.COWORKING_ADMIN && user.role !== UserRole.COWORKING_ADMIN) {
      throw new AppError('Unauthorized portal access for this account', 403);
    }
    if (
      expectedRole === UserRole.EMPLOYEE &&
      user.role === UserRole.SUPER_ADMIN
    ) {
      throw new AppError('Please use the Super Admin portal', 403);
    }
  }

  user.lastLoginAt = new Date();
  await user.save();

  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user, userAgent, ipAddress);

  let organization = null;
  if (user.organizationId) {
    organization = await CoworkingOrganization.findById(user.organizationId).select(
      'name slug currency timezone logoUrl'
    );
  }

  let company = null;
  if (user.companyId) {
    company = await Company.findById(user.companyId).select(
      'name status allowanceConfig'
    );
  }

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      organizationId: user.organizationId,
      companyId: user.companyId,
      organization,
      company,
      avatarUrl: user.avatarUrl
    }
  };
}

export async function refreshAccessToken(rawRefreshToken: string) {
  const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');

  const tokenDoc = await RefreshToken.findOne({
    tokenHash,
    isRevoked: false,
    expiresAt: { $gt: new Date() }
  });

  if (!tokenDoc) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const user = await User.findById(tokenDoc.userId);
  if (!user || !user.isActive) {
    throw new AppError('User account not found or deactivated', 401);
  }

  tokenDoc.isRevoked = true;
  await tokenDoc.save();

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = await generateRefreshToken(user);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  };
}

export async function logoutUser(rawRefreshToken: string) {
  if (!rawRefreshToken) return;
  const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
  await RefreshToken.updateOne({ tokenHash }, { $set: { isRevoked: true } });
}
