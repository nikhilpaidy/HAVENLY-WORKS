import { Request, Response, NextFunction } from 'express';
import { generateInvoiceForCompany } from './billing.service.js';
import { Invoice } from './invoice.model.js';
import { apiSuccess } from '../../utils/response.js';
import { AppError } from '../../middleware/errorHandler.js';
import { UserRole } from '../../types/index.js';
import { createAuditLog } from '../audit-logs/audit-log.service.js';

export async function getInvoicesHandler(req: Request, res: Response, next: NextFunction) {
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
    if (req.query.status) query.status = req.query.status;

    const invoices = await Invoice.find(query)
      .populate('companyId', 'name billingEmail')
      .sort({ createdAt: -1 });

    const normalized = invoices.map((inv: any) => {
      const obj = typeof inv.toObject === 'function' ? inv.toObject() : inv;
      return {
        ...obj,
        periodStart: obj.billingPeriodStart || obj.periodStart || obj.createdAt,
        periodEnd: obj.billingPeriodEnd || obj.periodEnd || obj.dueDate || obj.createdAt
      };
    });

    return apiSuccess(res, normalized);
  } catch (error) {
    next(error);
  }
}

export async function getInvoiceByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findById(id).populate('companyId');
    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    if (
      req.user?.role !== UserRole.SUPER_ADMIN &&
      invoice.organizationId.toString() !== req.user?.organizationId
    ) {
      throw new AppError('Unauthorized access to this invoice', 403);
    }
    if (
      req.user?.role !== UserRole.SUPER_ADMIN &&
      req.user?.role !== UserRole.COWORKING_ADMIN &&
      invoice.companyId.toString() !== req.user?.companyId
    ) {
      throw new AppError('Unauthorized access to this invoice', 403);
    }

    return apiSuccess(res, invoice);
  } catch (error) {
    next(error);
  }
}

export async function generateInvoiceHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId, taxRatePercent, notes } = req.body;
    const organizationId = req.user?.organizationId || req.body.organizationId;

    if (!companyId || !organizationId) {
      throw new AppError('companyId and organizationId are required', 400);
    }

    const invoice = await generateInvoiceForCompany({
      companyId,
      organizationId,
      taxRatePercent: taxRatePercent ? parseFloat(taxRatePercent) : 0,
      notes
    });

    await createAuditLog({
      organizationId: organizationId.toString(),
      userId: req.user!.userId,
      userEmail: req.user!.email,
      userRole: req.user!.role,
      action: 'INVOICE_GENERATED',
      entityType: 'Invoice',
      entityId: invoice._id.toString(),
      details: {
        invoiceNumber: invoice.invoiceNumber,
        companyId,
        totalAmount: invoice.totalAmount
      }
    });

    return apiSuccess(res, invoice, 'Invoice generated successfully', 201);
  } catch (error) {
    next(error);
  }
}
