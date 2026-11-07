import React from 'react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div className="space-y-2">
        <span className="text-xs uppercase tracking-wider font-semibold text-[#B6925A] dark:text-[#C5A880]">
          Governance & Security
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 dark:text-white">
          Privacy Policy
        </h1>
        <p className="text-xs text-slate-500">Last updated: October 2026</p>
      </div>

      <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm space-y-6 leading-relaxed">
        <p>
          At HavenlyWork Technologies, we hold workspace privacy to the highest architectural standards. This Privacy Policy details how we handle tenant company information, employee identities, and meeting reservation telemetry.
        </p>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Data Architecture & Tenant Scoping</h2>
        <p>
          All company records, employee credentials, meeting titles, attendee manifests, and internal invoices are strictly segmented using backend-enforced organization and company tenant identifiers. A tenant company can never view, index, or query data belonging to another tenant.
        </p>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. Authentication & Credential Storage</h2>
        <p>
          We employ salted bcrypt password hashing and cryptographic JSON Web Tokens. Passwords are never stored in plain text. Session tokens are rotated upon refresh, and stale sessions expire automatically via database TTL indexing.
        </p>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. Zero Data Monetization</h2>
        <p>
          HavenlyWork does not sell, lease, or monetize your company’s booking patterns, meeting topics, or billing figures to any third party. Your operational data remains exclusively yours.
        </p>
      </div>
    </div>
  );
};
