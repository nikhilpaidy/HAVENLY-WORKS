import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { InteractiveScheduler } from '../components/InteractiveScheduler.js';
import { ParticleCanvas } from '../components/ParticleCanvas.js';
import { BookingInquiryModal } from '../components/BookingInquiryModal.js';
import { getPublishedBlogs, BlogPostItem, getMediaUrl } from '../services/api.js';
import {
  ShieldCheck,
  Layers,
  ArrowRight,
  CheckCircle,
  Building,
  TrendingUp,
  Clock,
  Sparkles,
  Users,
  Code2,
  Calendar,
  Lock,
  DoorOpen,
  Award
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogPostItem[]>([]);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [selectedSpaceName, setSelectedSpaceName] = useState<string | undefined>(undefined);
  const portalUrl = import.meta.env.VITE_PORTAL_URL || 'http://localhost:5174';

  useEffect(() => {
    getPublishedBlogs({}).then((data) => setBlogs(data.slice(0, 4)));
  }, []);

  const handleOpenInquiry = (spaceTitle?: string) => {
    setSelectedSpaceName(spaceTitle);
    setIsInquiryModalOpen(true);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Interactive Constellation Particle Canvas */}
      <ParticleCanvas />

      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-16 overflow-hidden">
        {/* Ambient Glow Orbs */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-brand-500/10 dark:bg-brand-500/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 right-10 w-[400px] h-[300px] bg-gold-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 dark:bg-brand-500/15 text-brand-700 dark:text-brand-300 text-xs font-bold tracking-wider uppercase backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-gold-500 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Next-Generation Coworking & Meeting Operating System</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-display tracking-tight text-slate-900 dark:text-white leading-[1.08]">
              Architectural Spaces with{' '}
              <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-gold-400 bg-clip-text text-transparent">
                Zero Double Bookings
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Empower your executive coworking hubs with atomic inventory slot locks, automated monthly
              free-hour pools, and transparent extra-hour billing statements.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
              <a
                href={`${portalUrl}/admin/login`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-gold-500 text-white font-bold text-sm shadow-xl shadow-brand-500/25 hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
              >
                <span>Launch Hub Control Center</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                onClick={() => handleOpenInquiry()}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl glass-panel border border-slate-300/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:scale-[1.02] transition-all flex items-center justify-center space-x-2"
              >
                <Calendar className="w-4 h-4 text-brand-500" />
                <span>Schedule Campus Walkthrough</span>
              </button>
            </div>
          </div>

          {/* 3D Perspective Embedded Simulator Card */}
          <div className="mt-16 max-w-5xl mx-auto perspective-1000">
            <div className="card-3d-hover">
              <InteractiveScheduler />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Executive Meeting Spaces Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-gold-400">
              Campus Inventory
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-display text-slate-900 dark:text-white mt-1">
              Engineered for Critical Discussions
            </h2>
            <p className="text-sm text-slate-500 mt-2 max-w-xl">
              Equipped with studio-grade acoustic dampening, beamforming spatial video bars, and ultra-fast Wi-Fi 6E.
            </p>
          </div>

          <Link
            to="/meeting-rooms"
            className="mt-4 md:mt-0 font-bold text-xs text-brand-600 dark:text-gold-400 hover:underline flex items-center space-x-1.5 self-start md:self-auto"
          >
            <span>Explore All 5 Executive Spaces</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 3-Card 3D Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="glass-panel rounded-3xl overflow-hidden card-3d-hover border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between group">
            <div>
              <div className="relative h-56 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80"
                  alt="Apex Executive Boardroom"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold bg-[#050814]/80 text-gold-400 backdrop-blur-md border border-gold-500/30">
                  16 Seats • Dual 4K HDR
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-gold-400 transition-colors">
                  Apex Executive Boardroom
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Premier boardroom equipped with Cisco Room Kit Pro, Polycom acoustic array, and custom walnut conference table.
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    Dual 85" 4K Displays
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    STC 50 Acoustic Paneling
                  </span>
                </div>
              </div>
            </div>
            <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-800/60 mt-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">Rate</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">$75 / hour</span>
              </div>
              <button
                onClick={() => handleOpenInquiry('Apex Executive Boardroom')}
                className="px-4 py-2 rounded-xl bg-brand-500/10 dark:bg-gold-500/15 text-brand-600 dark:text-gold-400 text-xs font-bold hover:bg-brand-500 hover:text-white dark:hover:bg-gold-500 dark:hover:text-black transition-all"
              >
                Inquire
              </button>
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-panel rounded-3xl overflow-hidden card-3d-hover border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between group">
            <div>
              <div className="relative h-56 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80"
                  alt="Horizon Strategy Suite"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold bg-[#050814]/80 text-brand-400 backdrop-blur-md border border-brand-500/30">
                  10 Seats • Neat Bar Touch
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-gold-400 transition-colors">
                  Horizon Strategy Suite
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Tailored for hybrid team alignment, QBR leadership presentations, and high-velocity product sprint planning.
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    Interactive Touch Display
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    Acoustic Damping
                  </span>
                </div>
              </div>
            </div>
            <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-800/60 mt-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">Rate</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">$50 / hour</span>
              </div>
              <button
                onClick={() => handleOpenInquiry('Horizon Strategy Suite')}
                className="px-4 py-2 rounded-xl bg-brand-500/10 dark:bg-gold-500/15 text-brand-600 dark:text-gold-400 text-xs font-bold hover:bg-brand-500 hover:text-white dark:hover:bg-gold-500 dark:hover:text-black transition-all"
              >
                Inquire
              </button>
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-panel rounded-3xl overflow-hidden card-3d-hover border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between group">
            <div>
              <div className="relative h-56 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80"
                  alt="Acoustic Pod Suite"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold bg-[#050814]/80 text-emerald-400 backdrop-blur-md border border-emerald-500/30">
                  4 Seats • Soundproof STC 45
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-gold-400 transition-colors">
                  Focus Acoustic Pod Suite
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Confidential negotiation pod and studio-grade podcast recording booth with silent air exchange.
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    STC 45 Sound Isolation
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    Studio Mic Array
                  </span>
                </div>
              </div>
            </div>
            <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-800/60 mt-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">Rate</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">$25 / hour</span>
              </div>
              <button
                onClick={() => handleOpenInquiry('Focus Acoustic Pod Suite')}
                className="px-4 py-2 rounded-xl bg-brand-500/10 dark:bg-gold-500/15 text-brand-600 dark:text-gold-400 text-xs font-bold hover:bg-brand-500 hover:text-white dark:hover:bg-gold-500 dark:hover:text-black transition-all"
              >
                Inquire
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-widest font-bold text-brand-600 dark:text-gold-400">
            Engineering Excellence
          </span>
          <h2 className="text-3xl sm:text-4xl font-black font-display text-slate-900 dark:text-white mt-1">
            Built for High-Stakes Operations
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Why leading coworking operators standardise their campus technology on AURA.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-8 rounded-3xl card-3d-hover border border-slate-200/80 dark:border-slate-800/80 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
              Zero Double Bookings
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Enforced at the MongoDB engine layer via atomic compound indexes <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-brand-500">{`{ roomId: 1, slotTime: 1 }`}</code>.
              Simultaneous concurrent reservation collisions are mathematically impossible.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl card-3d-hover border border-slate-200/80 dark:border-slate-800/80 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-gold-500/10 text-gold-600 dark:text-gold-400 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
              Free Monthly Allowances
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Each enterprise member receives dedicated monthly hours with a double-entry ledger tracking
              holds, releases, and deductions. Overage fees apply automatically past quota.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl card-3d-hover border border-slate-200/80 dark:border-slate-800/80 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
              Automated Buffer Intervals
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Configurable 10 to 15-minute preparation buffers are automatically inserted after every booking,
              giving facilities staff time to reset rooms and sanitise equipment.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Swagger Docs Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="glass-panel glow-border p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <Code2 className="w-4 h-4" />
              <span>Interactive OpenAPI 3.0 Documentation</span>
            </div>
            <h3 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
              Developer-First Headless Architecture
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
              Inspect all endpoints, schemas, authentication contracts, and query parameters live in your browser.
            </p>
          </div>
          <a
            href="http://localhost:6018/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-2xl bg-[#0B1120] dark:bg-emerald-500 text-white dark:text-black font-bold text-xs hover:opacity-95 transition-all flex items-center space-x-2 shrink-0"
          >
            <span>Open Swagger UI</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Architecture & Engineering Insights Blog */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-brand-600 dark:text-gold-400">
              Engineering & Insights
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-display text-slate-900 dark:text-white mt-1">
              From Our Architectural Labs
            </h2>
          </div>
          <Link
            to="/blog"
            className="mt-4 sm:mt-0 font-bold text-xs text-brand-600 dark:text-gold-400 hover:underline flex items-center space-x-1.5"
          >
            <span>View All Publications</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {blogs.map((b) => (
            <Link
              key={b.slug}
              to={`/blog/${b.slug}`}
              className="glass-panel rounded-3xl overflow-hidden card-3d-hover border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between group"
            >
              <div>
                <div className="h-40 overflow-hidden relative">
                  <img
                    src={getMediaUrl(b.coverImageUrl) || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80'}
                    alt={b.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#050814]/80 text-brand-300 backdrop-blur-md">
                    {b.categories?.[0] || 'Insights'}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-gold-400 transition-colors line-clamp-2">
                    {b.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">
                    {b.excerpt}
                  </p>
                </div>
              </div>
              <div className="p-5 pt-0 text-[10px] text-slate-400 flex justify-between items-center border-t border-slate-100 dark:border-slate-800/60 mt-2">
                <span>{b.readTimeMinutes || 5} min read</span>
                <span className="font-semibold text-brand-600 dark:text-gold-400 flex items-center">
                  Read article →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Inquiry Modal */}
      <BookingInquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        spaceName={selectedSpaceName}
      />
    </div>
  );
};
