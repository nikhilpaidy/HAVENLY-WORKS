import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogOut, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const UnauthorizedPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  let fallbackPath = '/';
  if (user?.role === 'SUPER_ADMIN') fallbackPath = '/super-admin/dashboard';
  else if (user?.role === 'COWORKING_ADMIN') fallbackPath = '/admin/dashboard';
  else if (user) fallbackPath = '/client/dashboard';

  const handleSignOutAndSwitch = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-obsidian-950 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="max-w-md w-full glass-panel p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 text-center space-y-5 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-xl font-bold font-display text-slate-900 dark:text-white">
            Access Restricted
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
            Your current account <code className="text-rose-600 dark:text-rose-400 font-bold">{user?.email}</code> ({user?.role?.replace(/_/g, ' ') || 'Guest'}) does not have permission to view this section.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          {user && (
            <Link
              to={fallbackPath}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go to My Portal</span>
            </Link>
          )}

          <button
            onClick={handleSignOutAndSwitch}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors text-slate-700 dark:text-slate-300"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>Sign Out & Switch</span>
          </button>
        </div>

        <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
          <Link
            to="/"
            className="text-xs text-brand-600 dark:text-gold-400 hover:underline flex items-center justify-center space-x-1"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Unified Portal Hub</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
