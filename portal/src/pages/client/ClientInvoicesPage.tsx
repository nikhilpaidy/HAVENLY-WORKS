import React, { useEffect, useState } from 'react';
import { clientApi } from '../../services/api.js';
import {
  FileText,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Building,
  Info,
  ChevronRight,
  X
} from 'lucide-react';

interface InvoiceItem {
  _id: string;
  invoiceNumber: string;
  periodStart: string;
  periodEnd: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  currency: string;
  status: 'DRAFT' | 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'VOID';
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  createdAt: string;
}

export const ClientInvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);

  useEffect(() => {
    clientApi
      .getInvoices()
      .then((data) => setInvoices(data || []))
      .catch((err) => setError(err.message || 'Failed to load statements'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Loading invoices...</div>;
  }

  const outstandingTotal = invoices.reduce((acc, i) => acc + (i.amountDue || 0), 0);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#B6925A] dark:text-[#C5A880]">
            Billing & Invoicing
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white mt-1">
            Billing Statements
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review itemized monthly overage charges and recorded settlements.
          </p>
        </div>

        {outstandingTotal > 0 && (
          <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center space-x-2 self-start sm:self-auto">
            <span>Outstanding Balance: ${outstandingTotal.toFixed(2)}</span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Payment Instructions Banner (Phase 1 constraint compliant) */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-2">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 dark:text-white">
          <Info className="w-4 h-4 text-[#B6925A] dark:text-[#C5A880]" />
          <span>Payment Remittance Information</span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          In accordance with enterprise tenancy terms, overage statements can be remitted via corporate
          ACH/wire transfer or front desk POS terminal. Once received, our operations team logs the
          payment with verification in your audit trail.
        </p>
      </div>

      {/* Invoices Table */}
      <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800/80 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Statement #</th>
                <th className="py-3 px-4">Billing Period</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Paid to Date</th>
                <th className="py-3 px-4">Amount Due</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No billing statements issued yet.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const rawStart = (inv as any).billingPeriodStart || (inv as any).periodStart || inv.createdAt;
                  const rawEnd = (inv as any).billingPeriodEnd || (inv as any).periodEnd || (inv as any).dueDate || inv.createdAt;
                  const pStart = rawStart && !isNaN(new Date(rawStart).getTime())
                    ? new Date(rawStart).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric', year: 'numeric' })
                    : '01 Oct 2026';
                  const pEnd = rawEnd && !isNaN(new Date(rawEnd).getTime())
                    ? new Date(rawEnd).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric', year: 'numeric' })
                    : '31 Oct 2026';

                  return (
                    <tr key={inv._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#B6925A] dark:text-[#C5A880]">
                        {inv.invoiceNumber}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500">
                        {pStart} - {pEnd}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        ${(inv.totalAmount || 0).toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-emerald-600 dark:text-emerald-400">
                        ${(inv.amountPaid || 0).toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-amber-500">
                        ${(inv.amountDue || 0).toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            inv.status === 'PAID'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : inv.status === 'PARTIALLY_PAID'
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                              : inv.status === 'UNPAID'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                              : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          View Itemization
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Itemized Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold font-display text-slate-900 dark:text-white">
                  Statement Itemization
                </h2>
                <span className="text-xs text-slate-500 font-mono">
                  {selectedInvoice.invoiceNumber}
                </span>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-2">
                <span className="font-semibold text-slate-400 uppercase tracking-wider block">
                  Line Items
                </span>
                {selectedInvoice.lineItems && selectedInvoice.lineItems.length > 0 ? (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
                    {selectedInvoice.lineItems.map((item, idx) => (
                      <div key={idx} className="p-3 flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {item.description}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}
                          </div>
                        </div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          ${item.total.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400">No detailed line items available.</p>
                )}
              </div>

              {/* Totals Box */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span>${(selectedInvoice.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Tax:</span>
                  <span>${(selectedInvoice.taxAmount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-900 dark:text-white font-bold pt-1 border-t border-slate-200 dark:border-slate-800">
                  <span>Total Due:</span>
                  <span className="text-amber-500">${(selectedInvoice.amountDue || 0).toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-2 rounded-xl bg-[#141A29] dark:bg-[#C5A880] text-white dark:text-[#090D16] text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
