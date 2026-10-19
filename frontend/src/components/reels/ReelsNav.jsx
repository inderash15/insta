import React from 'react';
import { NavLink } from 'react-router-dom';
import { Film, Users, Flame, Bookmark, PlusCircle } from 'lucide-react';

export default function ReelsNav() {
  const tabs = [
    { label: 'For You', path: '/reels', icon: Film, end: true },
    { label: 'Following', path: '/reels/following', icon: Users },
    { label: 'Trending', path: '/reels/trending', icon: Flame },
    { label: 'Saved', path: '/reels/saved', icon: Bookmark },
    { label: 'Create', path: '/reels/create', icon: PlusCircle }
  ];

  return (
    <div className="w-full max-w-sm mb-4 mx-auto flex items-center justify-between bg-neutral-900/80 backdrop-blur border border-neutral-800 rounded-full p-1.5 px-3">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.path}
            to={tab.path}
            end={tab.end}
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`
            }
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{tab.label}</span>
          </NavLink>
        );
      })}
    </div>
  );
}
