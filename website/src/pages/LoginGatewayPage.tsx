import React from 'react';
import { ShieldCheck, Building2, Users, ArrowUpRight } from 'lucide-react';

export const LoginGatewayPage: React.FC = () => {
  const portalUrl = import.meta.env.VITE_PORTAL_URL || 'http://localhost:5174';

  const portals = [
    {
      role: 'Super Admin',
      badge: 'Platform Owner',
      desc: 'Global infrastructure, coworking business provisioning, platform revenue KPIs, and blog content CMS.',
      link: `${portalUrl}/super-admin/login`,
      icon: ShieldCheck,
      color: 'from-amber-500/20 to-amber-600/5'
    },
    {
      role: 'Coworking Admin',
      badge: 'Space Operator',
      desc: 'Physical locations, meeting rooms, company accounts, monthly allowances, room scheduling, and manual billing.',
      link: `${portalUrl}/admin/login`,
      icon: Building2,
      color: 'from-blue-500/20 to-indigo-600/5'
    },
    {
      role: 'Client Company',
      badge: 'Tenant Enterprise',
      desc: 'Room discovery, free-hour balance tracking, instant bookings, overage estimates, and invoice history.',
      link: `${portalUrl}/client/login`,
      icon: Users,
      color: 'from-emerald-500/20 to-teal-600/5'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-14">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase tracking-wider font-semibold text-[#B6925A] dark:text-[#C5A880]">
          Secure Authentication Gateway
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold font-display text-slate-900 dark:text-white">
          Choose Your Portal Experience
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
          AURA provides dedicated, role-optimized portals backed by strict server-side role and tenant authorization.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {portals.map((p, idx) => {
          const Icon = p.icon;
          return (
            <a
              key={idx}
              href={p.link}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-panel p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 hover:border-[#C5A880] transition-all flex flex-col justify-between group shadow-sm hover:shadow-xl"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-[#B6925A] dark:text-[#C5A880] flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {p.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white group-hover:text-[#B6925A] dark:group-hover:text-[#C5A880] transition-colors">
                    {p.role}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-white group-hover:text-[#B6925A] dark:group-hover:text-[#C5A880]">
                <span>Launch Portal</span>
                <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};
