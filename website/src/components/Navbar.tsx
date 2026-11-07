import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { HavenlyLogo } from './HavenlyLogo';
import {
  Building2,
  Menu,
  X,
  ChevronDown,
  DoorOpen,
  Users,
  Shield,
  Clock,
  Sparkles,
  ArrowRight,
  BookOpen,
  Code2,
  Layers,
  Calendar,
  CheckCircle2
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();

  const handleMouseEnter = (menu: string) => {
    setActiveDropdown(menu);
  };

  const handleMouseLeave = () => {
    setActiveDropdown(null);
  };

  return (
    <header className="sticky top-0 z-50 w-full px-4 sm:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto">
        <div className="glass-panel glow-border rounded-2xl px-5 py-3 flex items-center justify-between shadow-lg">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <HavenlyLogo size={36} variant="horizontal" tagline="togetherness" />
          </Link>

          {/* Desktop Navigation Links with Hover Dropdown Mega-Menus */}
          <nav className="hidden lg:flex items-center space-x-1" onMouseLeave={handleMouseLeave}>
            {/* SPACES HOVER DROPDOWN */}
            <div
              className="relative py-2"
              onMouseEnter={() => handleMouseEnter('spaces')}
            >
              <button className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-gold-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-all">
                <span>Spaces</span>
                <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
              </button>

              {/* Mega-menu panel */}
              {activeDropdown === 'spaces' && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[540px] animate-in fade-in zoom-in-95 duration-200">
                  <div className="glass-panel p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl space-y-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-gold-400 px-2">
                      Executive Spaces & Boardrooms
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Room 1 */}
                      <Link
                        to="/meeting-rooms"
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 hover:border-brand-500/50 dark:hover:border-gold-500/50 transition-all group flex space-x-3 items-center"
                      >
                        <img
                          src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=200&q=80"
                          alt="Boardroom"
                          className="w-16 h-14 rounded-lg object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-gold-400 truncate">
                            Executive Boardroom
                          </h4>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">
                            16 seats • Dual 4K Displays
                          </p>
                          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                            From $75/hr (Free on Quota)
                          </span>
                        </div>
                      </Link>

                      {/* Room 2 */}
                      <Link
                        to="/meeting-rooms"
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 hover:border-brand-500/50 dark:hover:border-gold-500/50 transition-all group flex space-x-3 items-center"
                      >
                        <img
                          src="https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=200&q=80"
                          alt="Strategy Suite"
                          className="w-16 h-14 rounded-lg object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-gold-400 truncate">
                            Strategy Suite
                          </h4>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">
                            10 seats • Neat Bar Pro Touch
                          </p>
                          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                            From $50/hr (Free on Quota)
                          </span>
                        </div>
                      </Link>

                      {/* Room 3 */}
                      <Link
                        to="/meeting-rooms"
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 hover:border-brand-500/50 dark:hover:border-gold-500/50 transition-all group flex space-x-3 items-center"
                      >
                        <img
                          src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=200&q=80"
                          alt="Creative Studio"
                          className="w-16 h-14 rounded-lg object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-gold-400 truncate">
                            Collaborative Studio
                          </h4>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">
                            6 seats • Glass Board Standup
                          </p>
                          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                            From $35/hr (Free on Quota)
                          </span>
                        </div>
                      </Link>

                      {/* Room 4 */}
                      <Link
                        to="/meeting-rooms"
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 hover:border-brand-500/50 dark:hover:border-gold-500/50 transition-all group flex space-x-3 items-center"
                      >
                        <img
                          src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=200&q=80"
                          alt="Acoustic Booth"
                          className="w-16 h-14 rounded-lg object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-gold-400 truncate">
                            Acoustic Pod Suite
                          </h4>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">
                            4 seats • Soundproof STC 45
                          </p>
                          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                            From $25/hr (Free on Quota)
                          </span>
                        </div>
                      </Link>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[11px] px-1">
                      <span className="text-slate-500">All spaces feature automated 15-min buffers</span>
                      <Link
                        to="/meeting-rooms"
                        className="font-bold text-brand-600 dark:text-gold-400 hover:underline flex items-center space-x-1"
                      >
                        <span>View All Spaces</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SOLUTIONS HOVER DROPDOWN */}
            <div
              className="relative py-2"
              onMouseEnter={() => handleMouseEnter('solutions')}
            >
              <button className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-gold-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-all">
                <span>Solutions</span>
                <ChevronDown className="w-3.5 h-3.5 transition-transform" />
              </button>

              {activeDropdown === 'solutions' && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[420px] animate-in fade-in zoom-in-95 duration-200">
                  <div className="glass-panel p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl space-y-2">
                    <Link
                      to="/for-owners"
                      className="p-3 rounded-xl hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-all flex items-start space-x-3 group"
                    >
                      <div className="p-2 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-gold-400">
                          For Coworking Operators & Owners
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Multi-campus management, slot buffer enforcement, and automated overage billing.
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/for-companies"
                      className="p-3 rounded-xl hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-all flex items-start space-x-3 group"
                    >
                      <div className="p-2 rounded-lg bg-gold-500/10 text-gold-600 dark:text-gold-400">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-gold-400">
                          For Enterprise & Client Companies
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Monthly free-hour pools, employee self-booking, and transparent ledger auditing.
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/how-it-works"
                      className="p-3 rounded-xl hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-all flex items-start space-x-3 group"
                    >
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-gold-400">
                          How Conflict-Free Scheduling Works
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          The math of half-open intervals [start, end) and atomic inventory locks.
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* DIRECT LINKS */}
            <Link
              to="/features"
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-gold-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-all"
            >
              Features
            </Link>

            <Link
              to="/pricing"
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-gold-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-all"
            >
              Pricing & Quotas
            </Link>

            {/* RESOURCES DROPDOWN */}
            <div
              className="relative py-2"
              onMouseEnter={() => handleMouseEnter('resources')}
            >
              <button className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-gold-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-all">
                <span>Resources</span>
                <ChevronDown className="w-3.5 h-3.5 transition-transform" />
              </button>

              {activeDropdown === 'resources' && (
                <div className="absolute top-full right-0 pt-2 w-[340px] animate-in fade-in zoom-in-95 duration-200">
                  <div className="glass-panel p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl space-y-2">
                    <Link
                      to="/blog"
                      className="p-2.5 rounded-xl hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-all flex items-center space-x-3 group"
                    >
                      <BookOpen className="w-4 h-4 text-brand-500" />
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-gold-400">
                          Architecture & Insights Blog
                        </div>
                        <div className="text-[10px] text-slate-500">4 featured executive articles</div>
                      </div>
                    </Link>

                    <a
                      href="http://localhost:6018/docs"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-all flex items-center space-x-3 group"
                    >
                      <Code2 className="w-4 h-4 text-emerald-500" />
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 flex items-center space-x-1">
                          <span>Swagger API Explorer</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono">
                            v1.0
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500">Interactive OpenAPI 3.0 documentation</div>
                      </div>
                    </a>

                    <Link
                      to="/contact"
                      className="p-2.5 rounded-xl hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-all flex items-center space-x-3 group"
                    >
                      <Sparkles className="w-4 h-4 text-gold-500" />
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-gold-400">
                          Schedule Private Walkthrough
                        </div>
                        <div className="text-[10px] text-slate-500">Tour campus facilities in person</div>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Action CTAs & Controls */}
          <div className="flex items-center space-x-2.5">
            <ThemeToggle />

            <Link
              to="/login-gateway"
              className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <span>Portals</span>
            </Link>

            <Link
              to="/meeting-rooms"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-gold-500 text-white text-xs font-bold shadow-md shadow-brand-500/20 hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center space-x-1.5"
            >
              <DoorOpen className="w-3.5 h-3.5" />
              <span>Book a Space</span>
            </Link>

            {/* Mobile hamburger button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-2 glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200 space-y-4">
            <nav className="flex flex-col space-y-1">
              <Link
                to="/meeting-rooms"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-between"
              >
                <span>Executive Meeting Rooms</span>
                <DoorOpen className="w-4 h-4 text-brand-500" />
              </Link>
              <Link
                to="/for-owners"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                For Space Operators
              </Link>
              <Link
                to="/for-companies"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                For Enterprise Clients
              </Link>
              <Link
                to="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                Pricing & Quotas
              </Link>
              <Link
                to="/blog"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                Insights & Blog
              </Link>
              <a
                href="http://localhost:6018/docs"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-between"
              >
                <span>Swagger API Docs</span>
                <Code2 className="w-4 h-4" />
              </a>
            </nav>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col space-y-2">
              <Link
                to="/login-gateway"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800"
              >
                Access Portal Gateway
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
