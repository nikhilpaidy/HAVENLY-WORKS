import React from 'react';
import { Link } from 'react-router-dom';
import { HavenlyLogo } from './HavenlyLogo';
import { ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  const portalUrl = import.meta.env.VITE_PORTAL_URL || 'http://localhost:5174';

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-[#FAF7F2] dark:bg-[#06080E] text-slate-600 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <HavenlyLogo size={40} variant="horizontal" tagline="togetherness" />
            <p className="text-sm max-w-sm leading-relaxed">
              SPACE FOR TOGETHERNESS • Cowork, connect and grow across Hyderabad’s premier hubs: Madhapur, Hitec City, Gachibowli, and Jubilee Hills.
            </p>
            <div className="pt-2 flex items-center space-x-2 text-xs text-[#00A859]">
              <ShieldCheck className="w-4 h-4" />
              <span>Engineered with mathematical zero-overlap reservation guarantees</span>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider font-display">
              Platform
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/features" className="hover:text-slate-900 dark:hover:text-white transition-colors">Features Matrix</Link></li>
              <li><Link to="/how-it-works" className="hover:text-slate-900 dark:hover:text-white transition-colors">How It Works</Link></li>
              <li><Link to="/meeting-rooms" className="hover:text-slate-900 dark:hover:text-white transition-colors">Room Engine</Link></li>
              <li><Link to="/pricing" className="hover:text-slate-900 dark:hover:text-white transition-colors">Pricing & Plans</Link></li>
              <li><Link to="/blog" className="hover:text-slate-900 dark:hover:text-white transition-colors">Knowledge Base</Link></li>
            </ul>
          </div>

          {/* Solutions Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider font-display">
              Solutions
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/for-owners" className="hover:text-slate-900 dark:hover:text-white transition-colors">Coworking Owners</Link></li>
              <li><Link to="/for-companies" className="hover:text-slate-900 dark:hover:text-white transition-colors">Tenant Companies</Link></li>
              <li><Link to="/about" className="hover:text-slate-900 dark:hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-slate-900 dark:hover:text-white transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          {/* Portals & Security */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider font-display">
              Portals
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href={`${portalUrl}/super-admin/login`} target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center space-x-1">
                  <span>Super Admin</span>
                </a>
              </li>
              <li>
                <a href={`${portalUrl}/admin/login`} target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center space-x-1">
                  <span>Coworking Admin</span>
                </a>
              </li>
              <li>
                <a href={`${portalUrl}/client/login`} target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center space-x-1">
                  <span>Client Company</span>
                </a>
              </li>
              <li className="pt-2">
                <Link to="/login" className="inline-block px-3 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 font-medium hover:border-[#C5A880] transition-colors">
                  Login Directory
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-8 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} HavenlyWork Technologies. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <Link to="/privacy" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms of Service</Link>
            <span>v1.0.0-production</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
