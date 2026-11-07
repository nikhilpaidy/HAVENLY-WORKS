import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '../../context/AuthContext.js';
import { ThemeToggle } from '../../components/ThemeToggle.js';
import { AuthRoleSwitcher } from '../../components/AuthRoleSwitcher.js';
import { HavenlyLogo } from '../../components/HavenlyLogo.js';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export const SuperAdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('paidynikhil@gmail.com');
  const [password, setPassword] = useState('Nikhil@123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password, UserRole.SUPER_ADMIN);
      navigate('/super-admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#050814] text-slate-900 dark:text-slate-100 relative overflow-hidden transition-colors">
      {/* Background architectural glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-brand-500/15 via-gold-500/10 to-transparent blur-3xl pointer-events-none" />

      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full glass-panel p-8 sm:p-10 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl relative z-10 space-y-6 bg-white/90 dark:bg-[#0e1424]/90 backdrop-blur-xl">
        {/* Role Switcher Tabs */}
        <AuthRoleSwitcher currentRole="SUPER_ADMIN" />

        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <HavenlyLogo size={36} variant="horizontal" tagline="togetherness" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#00A859] block">
            Platform Governance
          </span>
          <h1 className="text-2xl font-bold font-display tracking-tight text-slate-900 dark:text-white">
            Super Admin Control Suite
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Access global infrastructure, tenant management, and platform analytics.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-brand-500 text-slate-900 dark:text-white transition-colors"
                placeholder="paidynikhil@gmail.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Secret Key / Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-brand-500 text-slate-900 dark:text-white transition-colors"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-[#C5A880] dark:hover:bg-[#b8996e] text-white dark:text-[#090D16] font-bold text-sm transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Authorize Session'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
          Super Admin: <code className="text-brand-600 dark:text-[#C5A880] font-semibold">paidynikhil@gmail.com</code> / <code className="text-brand-600 dark:text-[#C5A880] font-semibold">Nikhil@123</code>
        </div>
      </div>
    </div>
  );
};
