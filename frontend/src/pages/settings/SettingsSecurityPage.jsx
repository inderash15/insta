import React from 'react';
import { Lock, ShieldCheck, Key, Laptop, Smartphone, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SettingsLayoutWrapper from '../../components/settings/SettingsLayoutWrapper';
import { useAuth } from '../../context/AuthContext';

export default function SettingsSecurityPage() {
  const { user } = useAuth();

  return (
    <SettingsLayoutWrapper
      title="Security Center"
      subtitle="Comprehensive security status, credential protections, and account safeguarding"
    >
      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
        <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-neutral-100">Strong Password Protection Active</p>
          <p className="text-[11px] text-neutral-400">Your password meets all complexity standards and is hashed with bcrypt.</p>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
          Security Controls
        </h2>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl divide-y divide-neutral-800/60 overflow-hidden">
          <Link
            to="/settings/password"
            className="p-4 flex items-center justify-between hover:bg-neutral-800/40 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-neutral-800 text-neutral-300 group-hover:text-pink-400 transition-colors">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-200 group-hover:text-pink-400 transition-colors">
                  Change Password
                </p>
                <p className="text-[11px] text-neutral-400">Regularly update your password to maintain peak defense</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-pink-400 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            to="/settings/two-factor"
            className="p-4 flex items-center justify-between hover:bg-neutral-800/40 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-neutral-800 text-neutral-300 group-hover:text-pink-400 transition-colors">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-200 group-hover:text-pink-400 transition-colors">
                  Two-Factor Authentication (2FA)
                </p>
                <p className="text-[11px] text-neutral-400">Require an authenticator code when logging in from new devices</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-pink-400 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            to="/settings/sessions"
            className="p-4 flex items-center justify-between hover:bg-neutral-800/40 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-neutral-800 text-neutral-300 group-hover:text-pink-400 transition-colors">
                <Laptop className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-200 group-hover:text-pink-400 transition-colors">
                  Active Login Sessions
                </p>
                <p className="text-[11px] text-neutral-400">Review recognized devices and revoke untrusted sessions</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-pink-400 group-hover:translate-x-1 transition-all" />
          </Link>
        </div>
      </div>
    </SettingsLayoutWrapper>
  );
}
