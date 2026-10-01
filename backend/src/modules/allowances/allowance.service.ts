import mongoose, { ClientSession, Types } from 'mongoose';
import { AllowancePeriod, AllowanceLedgerEntry, IAllowancePeriod } from './allowance.model.js';
import { Company } from '../companies/company.model.js';
import { getBillingPeriod } from '../../utils/date.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function getOrCreateCurrentAllowance(
  companyId: string | Types.ObjectId,
  date: Date = new Date(),
  session?: ClientSession
): Promise<IAllowancePeriod> {
  const company = await Company.findById(companyId).session(session || null);
  if (!company) {
    throw new AppError('Company not found', 404);
  }

  const period = getBillingPeriod(date, company.allowanceConfig.billingCycleStartDay);

  let allowance = await AllowancePeriod.findOne({
    companyId: company._id,
    periodYear: period.year,
    periodMonth: period.month
  }).session(session || null);

  if (!allowance) {
    const grantedHours = company.allowanceConfig.monthlyFreeHours;
    const docs = await AllowancePeriod.create(
      [
        {
          companyId: company._id,
          organizationId: company.organizationId,
          periodYear: period.year,
          periodMonth: period.month,
          periodStart: period.start,
          periodEnd: period.end,
          grantedHours,
          consumedHours: 0,
          reservedHours: 0,
          balanceHours: grantedHours
        }
      ],
      { session }
    );
    allowance = docs[0];

    await AllowanceLedgerEntry.create(
      [
        {
          companyId: company._id,
          organizationId: company.organizationId,
          allowancePeriodId: allowance._id,
          changeType: 'GRANT',
          hours: grantedHours,
          balanceAfter: grantedHours,
          notes: `Monthly quota granted for ${period.month}/${period.year}`
        }
      ],
      { session }
    );
  }

  return allowance;
}

export async function calculateEntitlement(
  companyId: string | Types.ObjectId,
  durationHours: number,
  bookingDate: Date = new Date(),
  session?: ClientSession
) {
  const company = await Company.findById(companyId).session(session || null);
  if (!company) {
    throw new AppError('Company not found', 404);
  }

  const allowance = await getOrCreateCurrentAllowance(companyId, bookingDate, session);
  const remainingFreeHours = Math.max(0, allowance.balanceHours);

  const freeHoursApplied = Number(Math.min(remainingFreeHours, durationHours).toFixed(2));
  const chargeableHours = Number(Math.max(0, durationHours - freeHoursApplied).toFixed(2));
  const additionalHourlyRate = company.allowanceConfig.additionalHourlyRate;
  const totalAmount = Number((chargeableHours * additionalHourlyRate).toFixed(2));

  return {
    allowancePeriodId: allowance._id,
    freeHoursApplied,
    chargeableHours,
    additionalHourlyRate,
    totalAmount,
    currency: company.allowanceConfig.currency || 'USD',
    remainingFreeHoursBefore: remainingFreeHours,
    remainingFreeHoursAfter: Number((remainingFreeHours - freeHoursApplied).toFixed(2))
  };
}

export async function reserveAllowance(
  companyId: string | Types.ObjectId,
  bookingId: Types.ObjectId,
  freeHours: number,
  bookingDate: Date,
  session?: ClientSession,
  bookingNumber?: string,
  roomName?: string
) {
  if (freeHours <= 0) return;

  const allowance = await getOrCreateCurrentAllowance(companyId, bookingDate, session);

  allowance.reservedHours = Number((allowance.reservedHours + freeHours).toFixed(2));
  allowance.balanceHours = Number((allowance.balanceHours - freeHours).toFixed(2));
  await allowance.save({ session });

  const label = bookingNumber || bookingId.toString().slice(-6).toUpperCase();
  const roomLabel = roomName ? ` (${roomName})` : '';

  await AllowanceLedgerEntry.create(
    [
      {
        companyId: new Types.ObjectId(companyId),
        organizationId: allowance.organizationId,
        allowancePeriodId: allowance._id,
        bookingId,
        changeType: 'RESERVE',
        hours: -Math.abs(freeHours),
        balanceAfter: allowance.balanceHours,
        notes: `Reserved ${freeHours} hr(s) for booking ${label}${roomLabel}`
      }
    ],
    { session }
  );
}

export async function releaseAllowance(
  companyId: string | Types.ObjectId,
  bookingId: Types.ObjectId,
  freeHours: number,
  bookingDate: Date,
  wasConsumed = false,
  session?: ClientSession,
  bookingNumber?: string
) {
  if (freeHours <= 0) return;

  const allowance = await getOrCreateCurrentAllowance(companyId, bookingDate, session);

  if (wasConsumed) {
    allowance.consumedHours = Number(Math.max(0, allowance.consumedHours - freeHours).toFixed(2));
  } else {
    allowance.reservedHours = Number(Math.max(0, allowance.reservedHours - freeHours).toFixed(2));
  }
  allowance.balanceHours = Number((allowance.balanceHours + freeHours).toFixed(2));
  await allowance.save({ session });

  const label = bookingNumber || bookingId.toString().slice(-6).toUpperCase();

  await AllowanceLedgerEntry.create(
    [
      {
        companyId: new Types.ObjectId(companyId),
        organizationId: allowance.organizationId,
        allowancePeriodId: allowance._id,
        bookingId,
        changeType: 'RELEASE',
        hours: Math.abs(freeHours),
        balanceAfter: allowance.balanceHours,
        notes: `Released ${freeHours} hr(s) from cancelled booking ${label}`
      }
    ],
    { session }
  );
}

export async function adjustAllowance(
  companyId: string | Types.ObjectId,
  hours: number, 
  notes: string,
  createdByUserId?: string | Types.ObjectId
) {
  const allowance = await getOrCreateCurrentAllowance(companyId, new Date());

  allowance.grantedHours = Number((allowance.grantedHours + hours).toFixed(2));
  allowance.balanceHours = Number((allowance.balanceHours + hours).toFixed(2));
  await allowance.save();

  const entry = await AllowanceLedgerEntry.create({
    companyId: new Types.ObjectId(companyId),
    organizationId: allowance.organizationId,
    allowancePeriodId: allowance._id,
    changeType: 'ADJUSTMENT',
    hours,
    balanceAfter: allowance.balanceHours,
    notes,
    createdBy: createdByUserId ? new Types.ObjectId(createdByUserId) : undefined
  });

  return {
    allowance,
    ledgerEntry: entry
  };
}
