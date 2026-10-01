import { Types } from 'mongoose';
import { Invoice, IInvoice } from './invoice.model.js';
import { Booking } from '../bookings/booking.model.js';
import { Company } from '../companies/company.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { BookingStatus, InvoiceStatus, NotificationType } from '../../types/index.js';
import { getBillingPeriod } from '../../utils/date.js';
import { createNotification } from '../notifications/notification.service.js';

export async function generateInvoiceForCompany(params: {
  companyId: string | Types.ObjectId;
  organizationId: string | Types.ObjectId;
  periodYear?: number;
  periodMonth?: number;
  taxRatePercent?: number; 
  notes?: string;
}): Promise<IInvoice> {
  const { companyId, organizationId, taxRatePercent = 0, notes } = params;

  const company = await Company.findById(companyId);
  if (!company) {
    throw new AppError('Company not found', 404);
  }

  const period = getBillingPeriod(
    new Date(),
    company.allowanceConfig.billingCycleStartDay
  );

  const bookings = await Booking.find({
    companyId: company._id,
    organizationId: new Types.ObjectId(organizationId),
    status: { $in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN, BookingStatus.COMPLETED] },
    startTime: { $gte: period.start, $lt: period.end },
    'pricingSnapshot.chargeableHours': { $gt: 0 }
  }).populate('roomId', 'name code');

  const lineItems = bookings.map((b: any) => ({
    description: `Extra Hours: ${b.roomId?.name || 'Meeting Room'} (${new Date(b.startTime).toLocaleDateString()}) - ${b.pricingSnapshot.chargeableHours} hrs @ ${b.pricingSnapshot.additionalHourlyRate}/${b.pricingSnapshot.currency}`,
    bookingId: b._id,
    quantityHours: b.pricingSnapshot.chargeableHours,
    unitPrice: b.pricingSnapshot.additionalHourlyRate,
    amount: b.pricingSnapshot.totalAmount
  }));

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = Number(((subtotal * taxRatePercent) / 100).toFixed(2));
  const totalAmount = Number((subtotal + taxAmount).toFixed(2));

  const timestamp = Date.now().toString().slice(-5);
  const invoiceNumber = `INV-${period.year}${String(period.month).padStart(2, '0')}-${timestamp}`;

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 15); 

  const invoice = await Invoice.create({
    invoiceNumber,
    organizationId: new Types.ObjectId(organizationId),
    companyId: company._id,
    billingPeriodStart: period.start,
    billingPeriodEnd: period.end,
    issueDate: new Date(),
    dueDate,
    lineItems,
    subtotal,
    taxAmount,
    totalAmount,
    amountPaid: 0,
    amountDue: totalAmount,
    currency: company.allowanceConfig.currency || 'USD',
    status: totalAmount === 0 ? InvoiceStatus.PAID : InvoiceStatus.ISSUED,
    notes: notes || `Billing statement for ${period.month}/${period.year}`
  });

  await createNotification({
    recipientUserId: company._id, 
    companyId: company._id,
    organizationId: new Types.ObjectId(organizationId),
    title: 'New Billing Statement Issued',
    message: `Invoice ${invoiceNumber} for ${invoice.currency} ${invoice.totalAmount} has been generated. Due date: ${dueDate.toLocaleDateString()}`,
    type: NotificationType.INVOICE_GENERATED,
    link: '/client/invoices'
  });

  return invoice;
}
