import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#090D16]">
      <div className="max-w-md w-full glass-panel p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 text-center space-y-4 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-[#B6925A]/10 text-[#B6925A] dark:text-[#C5A880] flex items-center justify-center mx-auto">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold font-display text-slate-900 dark:text-white">
          Page Not Found
        </h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          The requested portal resource does not exist or has been relocated.
        </p>
        <div className="pt-2">
          <Link
            to="/admin/login"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#141A29] dark:bg-[#C5A880] text-white dark:text-[#090D16] text-xs font-bold shadow-md hover:opacity-95 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Portal Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
