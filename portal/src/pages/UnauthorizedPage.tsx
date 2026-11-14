import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogOut, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const UnauthorizedPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  let fallbackPath = '/admin/login';
  if (user?.role === 'SUPER_ADMIN' || user?.role === 'SUPER_ADMIN_STAFF') fallbackPath = '/super-admin/dashboard';
  else if (user?.role === 'COWORKING_ADMIN' || user?.role === 'COWORKING_ADMIN_STAFF') fallbackPath = '/admin/dashboard';
  else if (user) fallbackPath = '/client/dashboard';

  const handleSignOutAndSwitch = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="max-w-md w-full p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">
            Access Restricted
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1.5">
            Your current account <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.email}</span> ({user?.role?.replace(/_/g, ' ') || 'Guest'}) does not have permission to view this section.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
          {user && (
            <Link
              to={fallbackPath}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold shadow-xs transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Go to My Portal</span>
            </Link>
          )}

          <button
            onClick={handleSignOutAndSwitch}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-colors text-slate-700 dark:text-slate-300"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-500" />
            <span>Sign Out & Switch</span>
          </button>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <Link
            to="/admin/login"
            className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white hover:underline flex items-center justify-center space-x-1"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
