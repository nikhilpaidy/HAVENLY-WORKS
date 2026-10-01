import { Request, Response, NextFunction } from 'express';
import { recordManualPayment, verifyPayment } from './payment.service.js';
import { PaymentRecord } from './payment.model.js';
import { apiSuccess } from '../../utils/response.js';
import { AppError } from '../../middleware/errorHandler.js';
import { UserRole } from '../../types/index.js';

export async function recordPaymentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId, invoiceId, amount, currency, paymentMethod, paymentReference, paymentDate, notes } = req.body;
    const organizationId = req.user?.organizationId || req.body.organizationId;

    if (!organizationId || !companyId || !amount || !paymentMethod) {
      throw new AppError('organizationId, companyId, amount, and paymentMethod are required', 400);
    }

    const payment = await recordManualPayment({
      organizationId,
      companyId,
      invoiceId,
      amount: parseFloat(amount),
      currency,
      paymentMethod,
      paymentReference,
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      notes,
      recordedByUserId: req.user!.userId,
      userEmail: req.user!.email,
      userRole: req.user!.role,
      ipAddress: req.ip
    });

    return apiSuccess(res, payment, 'Payment recorded successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function verifyPaymentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const payment = await verifyPayment({
      paymentId: id,
      verifiedByUserId: req.user!.userId,
      userEmail: req.user!.email,
      userRole: req.user!.role,
      ipAddress: req.ip
    });

    return apiSuccess(res, payment, 'Payment verified successfully');
  } catch (error) {
    next(error);
  }
}

export async function getPaymentsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    let query: any = {};

    if (req.user?.role === UserRole.SUPER_ADMIN) {
      if (req.query.organizationId) query.organizationId = req.query.organizationId;
    } else if (req.user?.role === UserRole.COWORKING_ADMIN) {
      query.organizationId = req.user.organizationId;
    } else {
      query.companyId = req.user?.companyId;
    }

    if (req.query.companyId && req.user?.role !== UserRole.EMPLOYEE) {
      query.companyId = req.query.companyId;
    }
    if (req.query.invoiceId) query.invoiceId = req.query.invoiceId;
    if (req.query.status) query.status = req.query.status;

    const payments = await PaymentRecord.find(query)
      .populate('companyId', 'name')
      .populate('recordedByUserId', 'name email')
      .populate('verifiedByUserId', 'name email')
      .sort({ createdAt: -1 });

    return apiSuccess(res, payments);
  } catch (error) {
    next(error);
  }
}
