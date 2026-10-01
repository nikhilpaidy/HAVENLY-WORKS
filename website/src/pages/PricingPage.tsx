import React from 'react';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PricingPage: React.FC = () => {
  const plans = [
    {
      name: 'Starter Hub',
      price: '$199',
      period: 'per month',
      description: 'Ideal for independent boutique coworking spaces and single executive hubs.',
      features: [
        '1 Physical Location',
        'Up to 5 Meeting Rooms',
        'Up to 30 Client Companies',
        'Atomic Zero-Overlap Engine',
        'Monthly Free-Hour Allowances',
        'In-App Notification Center',
        'Standard Support'
      ],
      popular: false
    },
    {
      name: 'Professional Network',
      price: '$499',
      period: 'per month',
      description: 'Designed for scaling multi-location coworking brands requiring comprehensive oversight.',
      features: [
        'Up to 3 Physical Locations',
        'Up to 20 Meeting Rooms',
        'Unlimited Client Companies',
        'Automated Billing Statements',
        'Manual Payment Reconciliation',
        'Custom Business Hours & Holidays',
        'Maintenance Closure Blocks',
        'Priority Technical Support'
      ],
      popular: true
    },
    {
      name: 'Enterprise Campus',
      price: '$899',
      period: 'per month',
      description: 'For commercial real estate portfolios and nationwide workspace networks.',
      features: [
        'Unlimited Locations & Rooms',
        'Unlimited Client Companies',
        'Custom Allowance Ledger Rules',
        'Super Admin Multi-Tenant Suite',
        'Dedicated Onboarding Engineer',
        '99.99% Uptime Guarantee',
        '24/7 Dedicated Concierge'
      ],
      popular: false
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase tracking-wider font-semibold text-[#B6925A] dark:text-[#C5A880]">
          Predictable Platform Pricing
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold font-display text-slate-900 dark:text-white">
          Transparent Investment for Modern Operators
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
          No hidden fees, no per-booking transaction commissions. Fixed SaaS plans with complete internal accounting.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, i) => (
          <div
            key={i}
            className={`rounded-3xl glass-panel p-8 sm:p-10 flex flex-col justify-between relative transition-all ${
              plan.popular
                ? 'border-2 border-[#C5A880] shadow-2xl scale-105 z-10'
                : 'border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#C5A880] text-[#090D16] shadow-sm">
                Most Popular
              </div>
            )}

            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
                  {plan.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 min-h-[32px]">
                  {plan.description}
                </p>
              </div>

              <div className="flex items-baseline space-x-2">
                <span className="text-4xl sm:text-5xl font-extrabold font-display text-slate-900 dark:text-white">
                  {plan.price}
                </span>
                <span className="text-sm text-slate-500">{plan.period}</span>
              </div>

              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300 pt-4 border-t border-slate-200 dark:border-slate-800">
                {plan.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center space-x-2.5">
                    <Check className="w-4 h-4 text-[#B6925A] dark:text-[#C5A880] shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-8">
              <Link
                to="/contact"
                className={`w-full py-3.5 px-4 rounded-2xl font-semibold text-sm text-center block transition-all shadow-md ${
                  plan.popular
                    ? 'bg-[#141A29] dark:bg-[#C5A880] text-white dark:text-[#090D16] hover:opacity-95'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Get Started
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
