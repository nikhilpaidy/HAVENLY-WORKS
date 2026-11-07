import React from 'react';
import { useAuth } from '../../context/AuthContext.js';
import {
  User,
  Building2,
  Mail,
  Shield,
  Clock,
  CreditCard,
  MapPin,
  CheckCircle,
  Key
} from 'lucide-react';

export const ClientProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Top Header */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-[#B6925A] dark:text-[#C5A880]">
          Account & Company
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white mt-1">
          Profile & Organization
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your personal credentials, role permissions, and company configuration.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-[#B6925A] dark:text-[#C5A880]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
                {user?.name}
              </h3>
              <span className="text-xs text-slate-400">Authenticated Member</span>
            </div>
          </div>

          <div className="space-y-3 pt-2 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500 flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Email Address:</span>
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">{user?.email}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500 flex items-center space-x-2">
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                <span>Portal Role:</span>
              </span>
              <span className="font-bold text-[#B6925A] dark:text-[#C5A880]">
                {user?.role?.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500 flex items-center space-x-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>Account Status:</span>
              </span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Active</span>
            </div>
          </div>
        </div>

        {/* Corporate Membership Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-[#B6925A] dark:text-[#C5A880]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
                {user?.company?.name || 'Client Corporation'}
              </h3>
              <span className="text-xs text-slate-400">Corporate Member Plan</span>
            </div>
          </div>

          <div className="space-y-3 pt-2 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500 flex items-center space-x-2">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Monthly Free Hours:</span>
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {user?.company?.allowanceConfig?.monthlyFreeHours || 20} hrs/mo
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500 flex items-center space-x-2">
                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                <span>Contract Overage Rate:</span>
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                ${user?.company?.allowanceConfig?.extraHourRate || 45}/hr
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500 flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Operator Hub:</span>
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {user?.organization?.name || 'HavenlyWork Madhapur Hub'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
