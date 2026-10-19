import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Settings, 
  User, 
  UserCheck, 
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
  Trash2 
} from 'lucide-react';

export const SETTINGS_LINKS = [
  { label: 'Overview', path: '/settings', icon: Settings, end: true },
  { label: 'Account Center', path: '/settings/account', icon: User },
  { label: 'Profile Settings', path: '/settings/profile', icon: UserCheck },
  { label: 'Privacy Controls', path: '/settings/privacy', icon: Shield },
  { label: 'Security Center', path: '/settings/security', icon: Lock },
  { label: 'Change Password', path: '/settings/password', icon: Key },
  { label: 'Active Sessions', path: '/settings/sessions', icon: Laptop },
  { label: 'Two-Factor Auth', path: '/settings/two-factor', icon: Smartphone },
  { label: 'Notifications', path: '/settings/notifications', icon: Bell },
  { label: 'Appearance', path: '/settings/appearance', icon: SunMoon },
  { label: 'Accessibility', path: '/settings/accessibility', icon: Eye },
  { label: 'Language', path: '/settings/language', icon: Globe },
  { label: 'Download Data', path: '/settings/data', icon: Download },
  { label: 'Delete Account', path: '/settings/delete-account', icon: Trash2, danger: true }
];

export default function SettingsNav() {
  return (
    <div className="w-full lg:w-64 bg-neutral-900/60 border border-neutral-800 rounded-2xl p-2 shrink-0 space-y-1">
      <div className="px-3 py-2 text-xs font-bold text-neutral-400 uppercase tracking-wider">
        Settings Menu
      </div>
      <div className="flex lg:flex-col overflow-x-auto no-scrollbar gap-1">
        {SETTINGS_LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-500/20 to-purple-600/20 text-pink-400 border border-pink-500/30 font-semibold'
                    : item.danger
                    ? 'text-red-400/80 hover:bg-red-500/10 hover:text-red-400'
                    : 'text-neutral-300 hover:bg-neutral-800/60 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
