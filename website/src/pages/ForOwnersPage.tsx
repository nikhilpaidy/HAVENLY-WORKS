import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const ForOwnersPage: React.FC = () => {
  const portalUrl = import.meta.env.VITE_PORTAL_URL || 'http://localhost:5174';

  const benefits = [
    {
      title: 'Eliminate Room Conflict Disputes',
      desc: 'No more double bookings or awkward customer interruptions. The atomic database locks guarantee physical room reservations are always exclusive.'
    },
    {
      title: 'Automated Allowance Enforcement',
      desc: 'Free hours are deducted automatically. Over-quota hours immediately calculate at company-specific contract rates without manual spreadsheet audits.'
    },
    {
      title: 'Multi-Location Hub Governance',
      desc: 'Manage several physical coworking branches across cities. Define business hours, weekend schedules, and holiday blackouts per location.'
    },
    {
      title: 'Direct Internal Accounting',
      desc: 'Issue comprehensive monthly statements. Record manual wire transfers, checks, or cash with strict audit logs and verification states.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase tracking-wider font-semibold text-[#B6925A] dark:text-[#C5A880]">
          Operator Command Center
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold font-display text-slate-900 dark:text-white">
          Built for Coworking Operators & Space Owners
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
          Transform meeting rooms from a source of operational headaches into a high-margin, automated revenue stream.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {benefits.map((b, i) => (
          <div key={i} className="glass-panel p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-3">
            <div className="flex items-center space-x-2 text-[#B6925A] dark:text-[#C5A880] font-semibold text-lg font-display">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{b.title}</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pl-7">
              {b.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl glass-panel p-10 border border-slate-200/80 dark:border-slate-800/80 text-center space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
          Ready to Streamline Your Facilities?
        </h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-sm">
          Access the dedicated Coworking Admin portal to calibrate rooms, onboard tenant companies, and monitor real-time utilization.
        </p>
        <div className="pt-2">
          <a
            href={`${portalUrl}/admin/login`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-2xl bg-[#141A29] dark:bg-[#C5A880] text-white dark:text-[#090D16] font-semibold text-base shadow-xl hover:opacity-95 transition-all"
          >
            <span>Open Admin Portal</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
