import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Sparkles, 
  Users, 
  Clock, 
  Bookmark, 
  Heart, 
  AtSign, 
  Hash, 
  Image, 
  Activity, 
  FileEdit, 
  Archive, 
  Eye 
} from 'lucide-react';

export default function FeedTabNav() {
  const tabs = [
    { to: '/home', label: 'For You', icon: Sparkles },
    { to: '/feed/following', label: 'Following', icon: Users },
    { to: '/feed/latest', label: 'Latest', icon: Clock },
    { to: '/feed/saved', label: 'Saved', icon: Bookmark },
    { to: '/feed/liked', label: 'Liked', icon: Heart },
    { to: '/feed/mentions', label: 'Mentions', icon: AtSign },
    { to: '/feed/hashtags', label: 'Hashtags', icon: Hash },
    { to: '/feed/media', label: 'Media', icon: Image },
    { to: '/feed/activity', label: 'Activity', icon: Activity },
    { to: '/feed/drafts', label: 'Drafts', icon: FileEdit },
    { to: '/feed/archived', label: 'Archive', icon: Archive },
    { to: '/feed/recently-viewed', label: 'Recent', icon: Eye }
  ];

  return (
    <div className="w-full overflow-x-auto no-scrollbar pb-3 mb-4 border-b border-neutral-800/80">
      <div className="flex items-center gap-1.5 min-w-max px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                  isActive
                    ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`
              }
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
