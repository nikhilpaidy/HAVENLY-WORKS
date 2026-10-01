import React from 'react';
import { ShieldCheck, Award, Globe } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase tracking-wider font-semibold text-[#B6925A] dark:text-[#C5A880]">
          Architectural Mission
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold font-display text-slate-900 dark:text-white">
          Pioneering Spatial Operations for the Modern Era
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
          AURA was born from a fundamental architectural conviction: high-performance workspaces deserve high-performance software.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-panel p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-[#B6925A] dark:text-[#C5A880] flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
            Uncompromising Standards
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            We reject the flimsy, generic templates that plague the workspace SaaS landscape. Every interaction in AURA is engineered for executive teams.
          </p>
        </div>

        <div className="glass-panel p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
            Algorithmic Integrity
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Our atomic reservation lock guarantees zero double bookings without relying on optimistic assumptions or race-condition-prone UI logic.
          </p>
        </div>

        <div className="glass-panel p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Globe className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
            Global Multi-Hub Vision
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Whether managing a flagship Midtown penthouse or a nationwide portfolio, AURA delivers unified visibility across all timezones.
          </p>
        </div>
      </div>
    </div>
  );
};
