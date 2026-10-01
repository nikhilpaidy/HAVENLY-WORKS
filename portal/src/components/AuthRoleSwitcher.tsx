import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldCheck, Building2, Users, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface AuthRoleSwitcherProps {
  currentRole: 'SUPER_ADMIN' | 'COWORKING_ADMIN' | 'CLIENT';
}

export const AuthRoleSwitcher: React.FC<AuthRoleSwitcherProps> = ({ currentRole }) => {
  const { user, isAuthenticated, logout } = useAuth();

  const tabs = [
    {
      role: 'SUPER_ADMIN',
      to: '/super-admin/login',
      label: 'Super Admin',
      icon: ShieldCheck
    },
    {
      role: 'COWORKING_ADMIN',
      to: '/admin/login',
      label: 'Coworking Admin',
      icon: Building2
    },
    {
      role: 'CLIENT',
      to: '/client/login',
      label: 'Client Member',
      icon: Users
    }
  ];

  return (
    <div className="space-y-3 mb-6">
      {/* Tab Switcher */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentRole === tab.role;
          return (
            <NavLink
              key={tab.role}
              to={tab.to}
              className={`flex items-center justify-center space-x-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all text-center ${
                isActive
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{tab.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Active Session Warning / Switcher */}
      {isAuthenticated && user && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-300 text-xs flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <span className="font-semibold block truncate">
              Signed in as: {user.email}
            </span>
            <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80">
              Role: {user.role?.replace(/_/g, ' ')}
            </span>
          </div>
          <button
            onClick={logout}
            type="button"
            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 dark:text-amber-200 text-[11px] font-bold shrink-0 transition-colors flex items-center space-x-1"
          >
            <LogOut className="w-3 h-3" />
            <span>Switch</span>
          </button>
        </div>
      )}
    </div>
  );
};
