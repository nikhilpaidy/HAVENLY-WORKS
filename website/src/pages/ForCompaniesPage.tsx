import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const ForCompaniesPage: React.FC = () => {
  const portalUrl = import.meta.env.VITE_PORTAL_URL || 'http://localhost:5174';

  const benefits = [
    {
      title: 'Real-Time Quota Visibility',
      desc: 'See exactly how many free hours remain in your company pool for the current billing cycle before booking a room.'
    },
    {
      title: 'Effortless Discovery & Instant Booking',
      desc: 'Filter boardrooms by attendee count, high-resolution screens, and conference microphones. Lock your time slot in two clicks.'
    },
    {
      title: 'Predictable Overage Pricing',
      desc: 'When an intensive design sprint requires extra hours beyond your monthly allowance, transparent agreed pricing applies with zero surprises.'
    },
    {
      title: 'Role-Based Team Access',
      desc: 'Company owners, project managers, and employees access the platform with role-appropriate permissions, preserving team autonomy.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase tracking-wider font-semibold text-[#B6925A] dark:text-[#C5A880]">
          Client Enterprise Experience
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold font-display text-slate-900 dark:text-white">
          A Frictionless Boardroom Experience for Your Team
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
          Eliminate meeting-space contention and booking guesswork. Reserve premium meeting rooms in seconds using your monthly company hours.
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
          Empower Your Team Today
        </h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-sm">
          Sign in to the Client Portal to inspect your current allowance balance and schedule your upcoming executive sessions.
        </p>
        <div className="pt-2">
          <a
            href={`${portalUrl}/client/login`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-2xl bg-[#141A29] dark:bg-[#C5A880] text-white dark:text-[#090D16] font-semibold text-base shadow-xl hover:opacity-95 transition-all"
          >
            <span>Sign In as Tenant Company</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
