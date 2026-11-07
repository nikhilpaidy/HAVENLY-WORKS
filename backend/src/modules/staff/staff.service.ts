
import { Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, IUser } from '../users/user.model.js';
import { Company } from '../companies/company.model.js';
import { UserRole } from '../../types/index.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function createStaffMember(data: {
  creatorUser: { userId: string; role: UserRole; organizationId?: string; companyId?: string };
  email: string;
  name: string;
  password: string;
  phone?: string;
  designation?: string;
  role: UserRole;
  permissions: string[];
}): Promise<IUser> {
  const existing = await User.findOne({ email: data.email.toLowerCase().trim() });
  if (existing) {
    throw new AppError('A user with this email address already exists', 409);
  }

  let assignedRole = data.role;
  let orgId = data.creatorUser.organizationId ? new Types.ObjectId(data.creatorUser.organizationId) : undefined;
  let compId = data.creatorUser.companyId ? new Types.ObjectId(data.creatorUser.companyId) : undefined;

  if (data.creatorUser.role === UserRole.SUPER_ADMIN) {
    assignedRole = UserRole.SUPER_ADMIN_STAFF;
  } else if (data.creatorUser.role === UserRole.COWORKING_ADMIN) {
    assignedRole = UserRole.COWORKING_ADMIN_STAFF;
  } else if (data.creatorUser.role === UserRole.COMPANY_OWNER) {
    assignedRole = UserRole.COMPANY_STAFF;
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(data.password, saltRounds);

  const staff = await User.create({
    email: data.email.toLowerCase().trim(),
    passwordHash,
    name: data.name.trim(),
    phone: data.phone?.trim(),
    role: assignedRole,
    designation: data.designation?.trim() || 'Staff Associate',
    permissions: data.permissions || [],
    parentUserId: new Types.ObjectId(data.creatorUser.userId),
    organizationId: orgId,
    companyId: compId,
    isActive: true
  });

  return staff;
}

export async function getStaffMembers(creatorUser: {
  userId: string;
  role: UserRole;
  organizationId?: string;
  companyId?: string;
}): Promise<IUser[]> {
  const query: any = { isActive: true };

  if (creatorUser.role === UserRole.SUPER_ADMIN) {
    query.role = UserRole.SUPER_ADMIN_STAFF;
  } else if (creatorUser.role === UserRole.COWORKING_ADMIN) {
    query.organizationId = new Types.ObjectId(creatorUser.organizationId);
    query.role = UserRole.COWORKING_ADMIN_STAFF;
  } else if (creatorUser.role === UserRole.COMPANY_OWNER) {
    query.companyId = new Types.ObjectId(creatorUser.companyId);
    query.role = { $in: [UserRole.COMPANY_STAFF, UserRole.COMPANY_BOOKING_MANAGER, UserRole.EMPLOYEE] };
  } else {
    return [];
  }

  return User.find(query).select('-passwordHash').sort({ createdAt: -1 });
}

export async function updateStaffPermissions(
  staffId: string,
  permissions: string[],
  designation?: string
): Promise<IUser> {
  const staff = await User.findById(staffId);
  if (!staff) {
    throw new AppError('Staff member not found', 404);
  }

  staff.permissions = permissions;
  if (designation !== undefined) {
    staff.designation = designation;
  }

  await staff.save();
  return staff;
}

export async function resetClientCompanyPassword(data: {
  coworkingAdminOrgId: string;
  companyId: string;
  newPassword: string;
}): Promise<void> {
  const company = await Company.findOne({
    _id: new Types.ObjectId(data.companyId),
    organizationId: new Types.ObjectId(data.coworkingAdminOrgId)
  });

  if (!company) {
    throw new AppError('Client company not found in your facility organization', 404);
  }

  const clientOwner = await User.findOne({
    companyId: company._id,
    role: UserRole.COMPANY_OWNER
  });

  if (!clientOwner) {
    throw new AppError('Client owner user record not found for this company', 404);
  }

  const passwordHash = await bcrypt.hash(data.newPassword, 10);
  clientOwner.passwordHash = passwordHash;
  await clientOwner.save();
}
