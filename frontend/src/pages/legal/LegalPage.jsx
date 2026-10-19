import React, { useState } from 'react';
import { FileText, Shield, Cookie, Users, CheckCircle2 } from 'lucide-react';

export default function LegalPage() {
  const [activeTab, setActiveTab] = useState('terms');

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 space-y-6">
      <div className="border-b border-neutral-800 pb-4">
        <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-100">
          Terms & Policies
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Last updated: October 2026 &bull; Governing use of the Insta platform
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-neutral-800 pb-2">
        {[
          { id: 'terms', label: 'Terms of Service', icon: FileText },
          { id: 'privacy', label: 'Privacy Policy', icon: Shield },
          { id: 'community', label: 'Community Guidelines', icon: Users },
          { id: 'cookies', label: 'Cookie Policy', icon: Cookie }
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-neutral-800 text-pink-400'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content based on tab */}
      <div className="p-6 bg-neutral-900/60 border border-neutral-800 rounded-2xl space-y-6 text-xs text-neutral-300 leading-relaxed">
        {activeTab === 'terms' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-neutral-100">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Insta, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
            <h2 className="text-sm font-bold text-neutral-100">2. User Conduct & Content Ownership</h2>
            <p>
              You retain ownership of any media, images, video, text, or remarks you upload. By posting on Insta, you grant us a non-exclusive, worldwide, royalty-free license to display, host, and distribute your content across our services in accordance with your privacy choices.
            </p>
            <h2 className="text-sm font-bold text-neutral-100">3. Account Termination</h2>
            <p>
              We reserve the right to suspend or permanently terminate accounts that repeatedly violate intellectual property rights, engage in spam operations, or distribute malicious software.
            </p>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-neutral-100">1. Information We Collect</h2>
            <p>
              We collect profile information you provide upon registration (username, email, bio) and technical metadata needed to render your personalized feed (uploaded media, likes, follows, messages).
            </p>
            <h2 className="text-sm font-bold text-neutral-100">2. Cookie & Session Storage</h2>
            <p>
              We use secure, HTTP-only session cookies to authenticate login requests and defend against Cross-Site Request Forgery (CSRF). Session tokens are never exposed to browser localStorage.
            </p>
            <h2 className="text-sm font-bold text-neutral-100">3. Your Data Rights (GDPR & CCPA)</h2>
            <p>
              You have the right to request a full copy of your data via the Settings &gt; Download Your Data page, or to permanently erase your records via Delete Account.
            </p>
          </div>
        )}

        {activeTab === 'community' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-neutral-100">1. Keep Content Safe & Authentic</h2>
            <p>
              Never post threats, explicit sexual exploitation, hate speech targeting protected groups, or personal identifying information of others without authorization.
            </p>
            <h2 className="text-sm font-bold text-neutral-100">2. Moderation Enforcement</h2>
            <p>
              Our automated and human moderation queue reviews reported content within 24 hours. Violating content is removed and accounts may receive warnings or permanent bans.
            </p>
          </div>
        )}

        {activeTab === 'cookies' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-neutral-100">1. Essential Authentication Cookies</h2>
            <p>
              Insta uses strictly necessary cookies to ensure you remain authenticated across page navigation and to protect against session hijacking.
            </p>
            <h2 className="text-sm font-bold text-neutral-100">2. Managing Preferences</h2>
            <p>
              You can configure your browser to reject cookies, but authenticated areas of Insta require session cookie support.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
