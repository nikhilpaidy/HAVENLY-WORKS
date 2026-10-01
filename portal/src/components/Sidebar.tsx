import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth, UserRole } from '../context/AuthContext.js';
import {
  Building2,
  LayoutDashboard,
  Building,
  Users,
  Calendar,
  Layers,
  FileText,
  TrendingUp,
  FileEdit,
  ClipboardList,
  DoorOpen,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Shield,
  Briefcase,
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface NavSection {
  title: string;
  items: Array<{ label: string; to: string; icon: any; badge?: string }>;
}

export const Sidebar: React.FC<{ onCloseMobile?: () => void }> = ({ onCloseMobile }) => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  let sections: NavSection[] = [];

  if (user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.SUPER_ADMIN_STAFF) {
    sections = [
      {
        title: 'OVERVIEW',
        items: [
          { label: 'Platform Dashboard', to: '/super-admin/dashboard', icon: LayoutDashboard }
        ]
      },
      {
        title: 'MANAGEMENT',
        items: [
          { label: 'Coworking Admins', to: '/super-admin/admins', icon: UserCheck },
          { label: 'Hub Organizations', to: '/super-admin/organizations', icon: Building },
          { label: 'Operations Staff', to: '/super-admin/staff', icon: Shield }
        ]
      },
      {
        title: 'GOVERNANCE & CMS',
        items: [
          { label: 'Global Analytics', to: '/super-admin/reports', icon: TrendingUp },
          { label: 'Editorial CMS', to: '/super-admin/blogs', icon: FileEdit, badge: 'Live' },
          { label: 'System Audit Logs', to: '/super-admin/audit-logs', icon: ClipboardList }
        ]
      }
    ];
  } else if (user?.role === UserRole.COWORKING_ADMIN || user?.role === UserRole.COWORKING_ADMIN_STAFF) {
    sections = [
      {
        title: 'WORKSPACE',
        items: [
          { label: 'Hub Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
          { label: 'Locations & Hours', to: '/admin/locations', icon: Building },
          { label: 'Meeting Rooms', to: '/admin/rooms', icon: DoorOpen }
        ]
      },
      {
        title: 'CLIENT OPERATIONS',
        items: [
          { label: 'Client Companies', to: '/admin/companies', icon: Users },
          { label: 'Master Reservations', to: '/admin/bookings', icon: Calendar },
          { label: 'Helpdesk & Complaints', to: '/admin/tickets', icon: HelpCircle },
          { label: 'Front Desk Staff', to: '/admin/staff', icon: Shield }
        ]
      },
      {
        title: 'FINANCE & ANALYTICS',
        items: [
          { label: 'Invoices & Ledger', to: '/admin/billing', icon: FileText },
          { label: 'Occupancy Reports', to: '/admin/reports', icon: TrendingUp }
        ]
      }
    ];
  } else {
    // Client roles
    sections = [
      {
        title: 'DASHBOARD',
        items: [
          { label: 'Client Overview', to: '/client/dashboard', icon: LayoutDashboard },
          { label: 'Discover Rooms', to: '/client/rooms', icon: DoorOpen }
        ]
      },
      {
        title: 'RESERVATIONS',
        items: [
          { label: 'My Bookings', to: '/client/bookings', icon: Calendar },
          { label: 'Free Hours Allowance', to: '/client/allowance', icon: Layers },
          { label: 'Facilities Helpdesk', to: '/client/tickets', icon: HelpCircle }
        ]
      },
      {
        title: 'ACCOUNT & TEAM',
        items: [
          { label: 'Billing Invoices', to: '/client/invoices', icon: FileText },
          { label: 'Team & Staff', to: '/client/staff', icon: Users },
          { label: 'Company Profile', to: '/client/profile', icon: Briefcase }
        ]
      }
    ];
  }

  const roleBadge = () => {
    if (user?.role === UserRole.SUPER_ADMIN) {
      return {
        label: 'Super Admin',
        color: 'text-gold-400 bg-gold-400/10 border-gold-400/20',
        icon: Shield
      };
    }
    if (user?.role === UserRole.COWORKING_ADMIN) {
      return {
        label: 'Space Operator',
        color: 'text-brand-600 dark:text-brand-400 bg-brand-500/10 border-brand-500/20',
        icon: Building
      };
    }
    return {
      label: 'Tenant Member',
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      icon: Briefcase
    };
  };

  const badgeConfig = roleBadge();
  const BadgeIcon = badgeConfig.icon;

  return (
    <aside
      className={`glass-panel border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between h-full py-5 px-3 transition-all duration-300 relative ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Collapse Toggle Button (desktop only) */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex absolute -right-3 top-7 w-6 h-6 rounded-full bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-slate-700 shadow-md items-center justify-center text-slate-500 hover:text-brand-500 z-30 transition-transform"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      <div className="space-y-6">
        {/* Brand header */}
        <div className={`flex items-center space-x-3 px-2 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 border border-gold-400/40 flex items-center justify-center text-gold-400 shadow-md shadow-brand-500/20 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-1.5">
                <span className="font-display font-black text-lg tracking-tight text-slate-900 dark:text-white">
                  AURA
                </span>
                <Sparkles className="w-3 h-3 text-gold-400 animate-pulse" />
              </div>
              <div className="flex items-center space-x-1 mt-0.5">
                <span
                  className={`text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded border ${badgeConfig.color}`}
                >
                  {badgeConfig.label}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Section List */}
        <nav className="space-y-5 overflow-y-auto max-h-[calc(100vh-210px)] pr-1">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {!collapsed && (
                <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                  {section.title}
                </div>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onCloseMobile}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative ${
                        isActive
                          ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25 dark:bg-brand-600 dark:text-white'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                      } ${collapsed ? 'justify-center px-0' : ''}`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                    {!collapsed && <span className="truncate flex-1">{item.label}</span>}
                    {!collapsed && item.badge && (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-gold-500/20 text-gold-600 dark:text-gold-300 border border-gold-500/30">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Tenant / User Summary */}
      <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 px-2">
        {!collapsed ? (
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold text-xs shrink-0">
              <BadgeIcon className="w-4 h-4 text-brand-500" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                {user?.organization?.name || user?.company?.name || 'AURA Platform'}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {user?.email}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div
              className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200"
              title={`${user?.name || 'User'} (${user?.email})`}
            >
              <BadgeIcon className="w-4 h-4 text-brand-500" />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
