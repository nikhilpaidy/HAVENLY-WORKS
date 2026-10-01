import React from 'react';
import { useAuth } from '../context/AuthContext.js';
import { ThemeToggle } from './ThemeToggle.js';
import { NotificationBell } from './NotificationBell.js';
import { LogOut, Menu } from 'lucide-react';

export const Header: React.FC<{ onOpenMobileMenu?: () => void }> = ({ onOpenMobileMenu }) => {
  const { user, logout } = useAuth();

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    return parts
      .map((n) => n[0] || '')
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  return (
    <header className="h-16 glass-panel border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 rounded-xl text-slate-700 dark:text-slate-300 lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Open mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <span className="text-xs font-semibold text-slate-500">Workspace /</span>{' '}
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            {user?.organization?.name || user?.company?.name || 'Platform Hub'}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-3 sm:space-x-4">
        <NotificationBell />
        <ThemeToggle />

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

        {/* User Card */}
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-brand-600 dark:bg-gold-500 text-white dark:text-obsidian-950 font-bold text-xs flex items-center justify-center shadow-sm">
            {getInitials(user?.name)}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              {user?.name || 'User'}
            </div>
            <div className="text-[10px] text-slate-500 font-medium">
              {user?.role ? user.role.replace(/_/g, ' ') : ''}
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          title="Sign Out"
          className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
