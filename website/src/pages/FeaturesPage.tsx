import React from 'react';
import {
  ShieldCheck,
  Layers,
  Clock,
  FileText,
  DollarSign,
  Bell,
  Lock,
  Building,
  CheckCircle2
} from 'lucide-react';

export const FeaturesPage: React.FC = () => {
  const features = [
    {
      icon: ShieldCheck,
      title: 'Atomic Inventory Lock Engine',
      category: 'Reservation Integrity',
      description:
        'Eliminates double bookings forever. Discrete normalized time slots protected by compound database unique indexes ensure that even under high concurrency, exactly one reservation succeeds.'
    },
    {
      icon: Layers,
      title: 'Dynamic Allowance Accounting',
      category: 'Quota Management',
      description:
        'Configurable monthly free-hour pools for each client company. Bookings seamlessly reserve and consume from the company pool, transitioning to company-specific hourly rates when quota is exceeded.'
    },
    {
      icon: Building,
      title: 'Multi-Location Operations',
      category: 'Workspace Control',
      description:
        'Manage multiple physical buildings, customized weekly business hours, holiday closures, and localized timezones within a unified administrative umbrella.'
    },
    {
      icon: Clock,
      title: 'Sanitation Buffers & Maintenance Blocks',
      category: 'Facility Readiness',
      description:
        'Automatic 15-minute or custom turnaround buffers prevent back-to-back overlap. Schedule planned maintenance closures that instantly remove inventory from client view.'
    },
    {
      icon: FileText,
      title: 'Automated Billing Statements',
      category: 'Financial Operations',
      description:
        'Reconcile chargeable extra-meeting hours into itemized statements and invoices with full transparency. Track total billed, amount collected, and outstanding receivables.'
    },
    {
      icon: DollarSign,
      title: 'Internal Payment Reconciliation',
      category: 'Independent Accounting',
      description:
        'Record manually received bank wire transfers, cash vouchers, and cheques. Maintain a strict separation between recorded entries and authorized administrative verification.'
    },
    {
      icon: Bell,
      title: 'In-App Notification Center',
      category: 'Real-Time Engagement',
      description:
        'MongoDB-backed in-app alerts notify employees and managers of booking confirmations, cancellation updates, low allowance thresholds, and billing statements.'
    },
    {
      icon: Lock,
      title: 'Strict Tenant Isolation & RBAC',
      category: 'Security Architecture',
      description:
        'Super Admin, Coworking Admin, and Client (Owner, Booking Manager, Employee) roles enforced at the database level. Companies can never view other tenants’ bookings or invoices.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase tracking-wider font-semibold text-[#B6925A] dark:text-[#C5A880]">
          Comprehensive Capabilities
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold font-display text-slate-900 dark:text-white">
          Architectural Features Matrix
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
          A functional platform engineered for commercial coworking enterprises. No placeholders, no third-party lock-in.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feat, i) => {
          const Icon = feat.icon;
          return (
            <div
              key={i}
              className="glass-panel p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-4 flex flex-col justify-between hover:border-[#C5A880]/50 transition-colors"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-[#B6925A] dark:text-[#C5A880] flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {feat.category}
                  </span>
                  <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white mt-1">
                    {feat.title}
                  </h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feat.description}
                </p>
              </div>
              <div className="pt-2 flex items-center space-x-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Production Verified</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
