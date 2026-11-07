import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '../../context/AuthContext.js';
import { ThemeToggle } from '../../components/ThemeToggle.js';
import { HavenlyLogo } from '../../components/HavenlyLogo.js';
import {
  ShieldCheck,
  Building2,
  Users,
  ArrowRight,
  Lock,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

export const PortalGatewayPage: React.FC = () => {
  const { login, logout, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  const handleQuickLogin = async (
    email: string,
    pass: string,
    role: UserRole,
    destination: string
  ) => {
    try {
      setLoadingRole(role);
      await login(email, pass, role);
      navigate(destination);
    } catch (err) {
      console.error(err);
      // Fallback navigate to login page
      navigate(
        role === UserRole.SUPER_ADMIN
          ? '/super-admin/login'
          : role === UserRole.COWORKING_ADMIN
          ? '/admin/login'
          : '/client/login'
      );
    } finally {
      setLoadingRole(null);
    }
  };

  const portalCards = [
    {
      role: 'Super Admin Suite',
      badge: 'Platform Governance',
      desc: 'Global tenant management, multi-organization billing oversight, executive audit trails, and editorial CMS.',
      email: 'paidynikhil@gmail.com',
      pass: 'Nikhil@123',
      userRole: UserRole.SUPER_ADMIN,
      dest: '/super-admin/dashboard',
      loginPath: '/super-admin/login',
      icon: ShieldCheck,
      color: 'from-brand-600 to-brand-800',
      badgeClass: 'text-gold-400 bg-gold-400/10 border-gold-400/25',
      primaryBtn: 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-500/25'
    },
    {
      role: 'Coworking Admin Portal',
      badge: 'Space Operator Hub',
      desc: 'Physical campuses, meeting room buffers, client companies, monthly free-hour quotas, and manual billing records.',
      email: 'cwsadmin@gmail.com',
      pass: 'Admin@123',
      userRole: UserRole.COWORKING_ADMIN,
      dest: '/admin/dashboard',
      loginPath: '/admin/login',
      icon: Building2,
      color: 'from-emerald-600 to-emerald-900',
      badgeClass: 'text-brand-500 bg-brand-500/10 border-brand-500/25',
      primaryBtn: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/25'
    },
    {
      role: 'Client Member Portal',
      badge: 'Tenant Enterprise Access',
      desc: 'Discover rooms, reserve executive suites, inspect real-time monthly allowance balances, and download monthly statements.',
      email: 'aptapace@gmail.com',
      pass: 'Client@123',
      userRole: UserRole.COMPANY_OWNER,
      dest: '/client/dashboard',
      loginPath: '/client/login',
      icon: Users,
      color: 'from-teal-600 to-teal-800',
      badgeClass: 'text-teal-500 bg-teal-500/10 border-teal-500/25',
      primaryBtn: 'bg-teal-600 hover:bg-teal-500 text-white shadow-teal-500/25'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-obsidian-950 text-slate-900 dark:text-slate-100 relative overflow-hidden transition-colors flex flex-col justify-between p-6 sm:p-12">
      {/* Background ambient lighting */}
      <div className="absolute top-1/6 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-brand-500/15 via-gold-500/10 to-transparent blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <header className="flex items-center justify-between relative z-10 max-w-7xl mx-auto w-full">
        <HavenlyLogo size={42} variant="horizontal" tagline="togetherness" />

        <div className="flex items-center space-x-4">
          {isAuthenticated && user && (
            <div className="hidden sm:flex items-center space-x-3 text-xs bg-slate-100 dark:bg-slate-900/80 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500">Active session:</span>
              <span className="font-bold text-slate-900 dark:text-white">{user.email}</span>
              <button
                onClick={logout}
                className="text-rose-500 hover:underline font-semibold ml-2"
              >
                Sign Out
              </button>
            </div>
          )}
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto w-full py-12 relative z-10 space-y-12">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-gold-400">
            Unified Portal Access Hub
          </span>
          <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-slate-900 dark:text-white">
            Select Your Dedicated Portal
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Access platform governance, space operator controls, or corporate client booking suites with single-click verification.
          </p>
        </div>

        {/* 3 Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {portalCards.map((card, idx) => {
            const Icon = card.icon;
            const isLoading = loadingRole === card.userRole;

            return (
              <div
                key={idx}
                className="glass-panel p-8 rounded-3xl border border-slate-200/90 dark:border-slate-800/90 shadow-xl flex flex-col justify-between card-3d-hover group relative overflow-hidden"
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-white flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
                      <Icon className="w-7 h-7 text-gold-400" />
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${card.badgeClass}`}
                    >
                      {card.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-gold-400 transition-colors">
                      {card.role}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 space-y-1 text-xs">
                    <div className="text-[10px] uppercase font-bold text-slate-400">
                      Verified Credentials
                    </div>
                    <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                      <span className="font-mono text-[11px] truncate">{card.email}</span>
                      <span className="font-mono text-[11px] text-slate-400">••••••••</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800/80 mt-6 space-y-2.5">
                  <button
                    onClick={() =>
                      handleQuickLogin(card.email, card.pass, card.userRole, card.dest)
                    }
                    disabled={isLoading}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 ${card.primaryBtn}`}
                  >
                    {isLoading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>1-Click Launch & Login</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => navigate(card.loginPath)}
                    className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors flex items-center justify-center space-x-1"
                  >
                    <span>Custom Login Form</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer info */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full text-center text-xs text-slate-500 pt-6 border-t border-slate-200/80 dark:border-slate-800/80">
        HavenlyWork Enterprise Platform • SPACE FOR TOGETHERNESS • Hyderabad Madhapur Hubs
      </footer>
    </div>
  );
};
