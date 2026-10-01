import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.js';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';

import { HomePage } from './pages/HomePage.js';
import { FeaturesPage } from './pages/FeaturesPage.js';
import { HowItWorksPage } from './pages/HowItWorksPage.js';
import { ForOwnersPage } from './pages/ForOwnersPage.js';
import { ForCompaniesPage } from './pages/ForCompaniesPage.js';
import { MeetingRoomsPage } from './pages/MeetingRoomsPage.js';
import { PricingPage } from './pages/PricingPage.js';
import { BlogListPage } from './pages/BlogListPage.js';
import { BlogDetailPage } from './pages/BlogDetailPage.js';
import { AboutPage } from './pages/AboutPage.js';
import { ContactPage } from './pages/ContactPage.js';
import { PrivacyPage } from './pages/PrivacyPage.js';
import { TermsPage } from './pages/TermsPage.js';
import { LoginGatewayPage } from './pages/LoginGatewayPage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-[#FAF7F2] dark:bg-[#090D16] text-slate-900 dark:text-slate-100 transition-colors duration-200">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/for-owners" element={<ForOwnersPage />} />
              <Route path="/for-companies" element={<ForCompaniesPage />} />
              <Route path="/meeting-rooms" element={<MeetingRoomsPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/blog" element={<BlogListPage />} />
              <Route path="/blog/:slug" element={<BlogDetailPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/login" element={<LoginGatewayPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
};
