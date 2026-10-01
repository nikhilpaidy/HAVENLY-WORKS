import React from 'react';
import { Building, Users, Calendar, ShieldCheck, FileCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      step: '01',
      icon: Building,
      title: 'Facility Setup & Room Calibration',
      subtitle: 'For Coworking Admins',
      desc: 'Define locations, customized weekly opening/closing hours, room capacities, hardware amenities, minimum durations, and mandatory cleaning buffer intervals.'
    },
    {
      step: '02',
      icon: Users,
      title: 'Client Enterprise Provisioning',
      subtitle: 'For Company Owners',
      desc: 'Each company receives an individualized monthly free-hour allowance (e.g. 15 hrs) and a pre-agreed hourly rate for overage hours. Employees are invited with role-based permissions.'
    },
    {
      step: '03',
      icon: Calendar,
      title: 'Real-Time Discovery & Reservation',
      subtitle: 'For Team Members',
      desc: 'Employees filter rooms by capacity and audio-visual equipment. The platform displays real-time available half-open intervals [startTime, endTime) across valid operating hours.'
    },
    {
      step: '04',
      icon: ShieldCheck,
      title: 'Atomic Quota & Inventory Lock',
      subtitle: 'Under the Hood',
      desc: 'The backend transaction calculates remaining company quota, deducts free hours, estimates extra charges, and atomically reserves all required 15-min inventory units simultaneously.'
    },
    {
      step: '05',
      icon: FileCheck,
      title: 'Billing Statements & Payment Logging',
      subtitle: 'For Operations & Finance',
      desc: 'At billing cycle close, overage bookings automatically generate itemized invoices. Operators record incoming wire, cash, or cheque payments with complete verification audit trails.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase tracking-wider font-semibold text-[#B6925A] dark:text-[#C5A880]">
          End-to-End Workflow
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold font-display text-slate-900 dark:text-white">
          How the Platform Works
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
          From physical room definition to atomic inventory locks and automatic monthly allowance accounting.
        </p>
      </div>

      <div className="space-y-8 max-w-4xl mx-auto">
        {steps.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="glass-panel p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center gap-6 hover:border-[#C5A880]/50 transition-colors"
            >
              <div className="flex items-center space-x-4 shrink-0">
                <span className="text-3xl font-extrabold font-display text-[#B6925A] dark:text-[#C5A880]">
                  {item.step}
                </span>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-[#B6925A] dark:text-[#C5A880] flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
              </div>

              <div className="flex-1 space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {item.subtitle}
                </span>
                <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center pt-8">
        <Link
          to="/for-owners"
          className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-2xl bg-[#141A29] dark:bg-[#C5A880] text-white dark:text-[#090D16] font-semibold text-base shadow-xl hover:opacity-95 transition-all"
        >
          <span>Explore Operator Features</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
