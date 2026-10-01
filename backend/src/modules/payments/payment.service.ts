import { Types } from 'mongoose';
import { PaymentRecord, IPaymentRecord } from './payment.model.js';
import { Invoice } from '../billing/invoice.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { InvoiceStatus, NotificationType, PaymentMethod, PaymentStatus, UserRole } from '../../types/index.js';
import { createAuditLog } from '../audit-logs/audit-log.service.js';
import { createNotification } from '../notifications/notification.service.js';

export async function recordManualPayment(params: {
  organizationId: string | Types.ObjectId;
  companyId: string | Types.ObjectId;
  invoiceId?: string | Types.ObjectId;
  amount: number;
  currency?: string;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  paymentDate?: Date;
  notes?: string;
  recordedByUserId: string | Types.ObjectId;
  userEmail: string;
  userRole: UserRole;
  ipAddress?: string;
}): Promise<IPaymentRecord> {
  const {
    organizationId,
    companyId,
    invoiceId,
    amount,
    currency = 'USD',
    paymentMethod,
    paymentReference,
    paymentDate = new Date(),
    notes,
    recordedByUserId,
    userEmail,
    userRole,
    ipAddress
  } = params;

  if (amount <= 0) {
    throw new AppError('Payment amount must be greater than zero', 400);
  }

  let invoice = null;
  if (invoiceId) {
    invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }
  }

  const timestamp = Date.now().toString().slice(-6);
  const receiptNumber = `REC-${new Date().getFullYear()}-${timestamp}`;

  const payment = await PaymentRecord.create({
    receiptNumber,
    organizationId: new Types.ObjectId(organizationId),
    companyId: new Types.ObjectId(companyId),
    invoiceId: invoice ? invoice._id : undefined,
    amount,
    currency: invoice ? invoice.currency : currency,
    paymentMethod,
    paymentReference,
    paymentDate,
    status: PaymentStatus.RECORDED,
    notes,
    recordedByUserId: new Types.ObjectId(recordedByUserId)
  });

  if (invoice) {
    invoice.amountPaid = Number((invoice.amountPaid + amount).toFixed(2));
    invoice.amountDue = Number(Math.max(0, invoice.totalAmount - invoice.amountPaid).toFixed(2));

    if (invoice.amountDue <= 0) {
      invoice.status = InvoiceStatus.PAID;
    } else {
      invoice.status = InvoiceStatus.PARTIALLY_PAID;
    }

    await invoice.save();
  }

  await createAuditLog({
    organizationId: organizationId.toString(),
    userId: recordedByUserId,
    userEmail,
    userRole,
    action: 'PAYMENT_RECORDED',
    entityType: 'PaymentRecord',
    entityId: payment._id.toString(),
    ipAddress,
    details: {
      receiptNumber,
      amount,
      paymentMethod,
      paymentReference,
      invoiceNumber: invoice?.invoiceNumber
    }
  });

  await createNotification({
    recipientUserId: companyId,
    companyId: new Types.ObjectId(companyId),
    organizationId: new Types.ObjectId(organizationId),
    title: 'Payment Recorded',
    message: `A payment of ${payment.currency} ${payment.amount} has been recorded (Receipt: ${receiptNumber}, Method: ${paymentMethod}).`,
    type: NotificationType.PAYMENT_RECORDED,
    link: '/client/billing'
  });

  return payment;
}

export async function verifyPayment(params: {
  paymentId: string;
  verifiedByUserId: string;
  userEmail: string;
  userRole: UserRole;
  ipAddress?: string;
}): Promise<IPaymentRecord> {
  const { paymentId, verifiedByUserId, userEmail, userRole, ipAddress } = params;

  const payment = await PaymentRecord.findById(paymentId);
  if (!payment) {
    throw new AppError('Payment record not found', 404);
  }

  payment.status = PaymentStatus.VERIFIED;
  payment.verifiedByUserId = new Types.ObjectId(verifiedByUserId);
  payment.verifiedAt = new Date();
  await payment.save();

  await createAuditLog({
    organizationId: payment.organizationId.toString(),
    userId: verifiedByUserId,
    userEmail,
    userRole,
    action: 'PAYMENT_VERIFIED',
    entityType: 'PaymentRecord',
    entityId: payment._id.toString(),
    ipAddress,
    details: {
      receiptNumber: payment.receiptNumber,
      amount: payment.amount
    }
  });

  return payment;
}
