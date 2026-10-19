import React from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Shield, 
  Lock, 
  Key, 
  Laptop, 
  Smartphone, 
  Bell, 
  SunMoon, 
  Eye, 
  Globe, 
  Download, 
  Trash2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import SettingsLayoutWrapper from '../../components/settings/SettingsLayoutWrapper';
import { useAuth } from '../../context/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();

  const sections = [
    {
      title: 'Account & Profile',
      items: [
        { label: 'Personal Information', path: '/settings/account', desc: 'Email, contact details, account date', icon: User },
        { label: 'Profile Customization', path: '/settings/profile', desc: 'Bio, pronouns, avatar, website', icon: User }
      ]
    },
    {
      title: 'Security & Access',
      items: [
        { label: 'Change Password', path: '/settings/password', desc: 'Update and strengthen account password', icon: Key },
        { label: 'Two-Factor Authentication', path: '/settings/two-factor', desc: 'Add security with authenticator codes', icon: Smartphone },
        { label: 'Active Sessions', path: '/settings/sessions', desc: 'Manage logged-in devices and revoke sessions', icon: Laptop },
        { label: 'Security Center', path: '/settings/security', desc: 'Overall health audit and access logs', icon: Lock }
      ]
    },
    {
      title: 'Privacy & Permissions',
      items: [
        { label: 'Account Privacy', path: '/settings/privacy', desc: 'Private account status and activity indicators', icon: Shield },
        { label: 'Notifications', path: '/settings/notifications', desc: 'Configure alerts for likes, follows, comments', icon: Bell }
      ]
    },
    {
      title: 'Preferences & System',
      items: [
        { label: 'Appearance', path: '/settings/appearance', desc: 'Dark mode, Light mode, or System Default', icon: SunMoon },
        { label: 'Accessibility', path: '/settings/accessibility', desc: 'Contrast, reduced motion, media autoplay', icon: Eye },
        { label: 'Language', path: '/settings/language', desc: 'Display language and regional numeral formatting', icon: Globe },
        { label: 'Download Your Data', path: '/settings/data', desc: 'Request full JSON archive of your account data', icon: Download },
        { label: 'Delete Account', path: '/settings/delete-account', desc: 'Permanent account closure and anonymization', icon: Trash2, danger: true }
      ]
    }
  ];

  return (
    <SettingsLayoutWrapper
      title="Settings & Preferences"
      subtitle={`Logged in as @${user?.username} (${user?.email})`}
    >
      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-100">Account Health: Protected</p>
            <p className="text-[11px] text-neutral-400">All security policies and session checks are verified.</p>
          </div>
        </div>
        <Link
          to="/settings/security"
          className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/30"
        >
          Audit
        </Link>
      </div>

      <div className="space-y-6">
        {sections.map((sec) => (
          <div key={sec.title} className="space-y-2">
            <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              {sec.title}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sec.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-2xl hover:border-pink-500/50 transition-all flex items-center justify-between group shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${item.danger ? 'bg-red-500/10 text-red-400' : 'bg-neutral-800 text-neutral-300 group-hover:text-pink-400'} transition-colors`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className={`text-xs font-semibold ${item.danger ? 'text-red-400' : 'text-neutral-200 group-hover:text-pink-400'} transition-colors`}>
                          {item.label}
                        </p>
                        <p className="text-[10px] text-neutral-500">{item.desc}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-pink-400 group-hover:translate-x-1 transition-all" />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </SettingsLayoutWrapper>
  );
}
