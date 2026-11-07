import React from 'react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div className="space-y-2">
        <span className="text-xs uppercase tracking-wider font-semibold text-[#B6925A] dark:text-[#C5A880]">
          Commercial Agreement
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 dark:text-white">
          Terms of Service
        </h1>
        <p className="text-xs text-slate-500">Last updated: October 2026</p>
      </div>

      <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm space-y-6 leading-relaxed">
        <p>
          These Terms of Service govern the subscription, access, and utilization of the HavenlyWork Coworking & Meeting Room Platform by Coworking Business Owners and Tenant Companies.
        </p>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Reservation Exclusivity Guarantee</h2>
        <p>
          The platform guarantees atomic reservation isolation. A confirmed booking allocates discrete inventory slots that cannot be simultaneously held or confirmed by any other user.
        </p>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. Free-Hour Quotas & Over-Quota Pricing</h2>
        <p>
          Tenant companies receive a monthly complimentary hour pool configured by the Coworking Admin. Extra hours booked beyond the monthly quota are billable at the company’s agreed hourly rate.
        </p>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. Manual Payment Recording & Accounting</h2>
        <p>
          Phase 1 facilitates internal invoice generation and manual payment recording (wire transfer, cheque, cash). A recorded payment constitutes an internal administrative entry, distinct from external automated payment verification.
        </p>
      </div>
    </div>
  );
};
