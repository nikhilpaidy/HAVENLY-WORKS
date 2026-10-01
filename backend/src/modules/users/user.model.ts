/**
 * User Model for Coworking Monolith.
 * Supports platform super admins, coworking facility admins, enterprise company owners,
 * and sub-staff with dynamic, fine-grained access permissions.
 */

import mongoose, { Document, Schema, Types } from 'mongoose';
import { UserRole } from '../../types/index.js';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  phone?: string;
  role: UserRole;
  designation?: string;
  permissions: string[];
  parentUserId?: Types.ObjectId;
  organizationId?: Types.ObjectId;
  companyId?: Types.ObjectId;
  isActive: boolean;
  avatarUrl?: string;
  lastLoginAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
      index: true
    },
    designation: {
      type: String,
      trim: true
    },
    permissions: {
      type: [String],
      default: []
    },
    parentUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'CoworkingOrganization',
      index: true
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      index: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    avatarUrl: {
      type: String
    },
    lastLoginAt: {
      type: Date
    },
    passwordResetToken: {
      type: String
    },
    passwordResetExpires: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

UserSchema.index({ organizationId: 1, role: 1 });
UserSchema.index({ companyId: 1, role: 1 });
UserSchema.index({ parentUserId: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
