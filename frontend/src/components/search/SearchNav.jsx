import React from 'react';
import { NavLink } from 'react-router-dom';
import { Search, Users, Image, Hash, MapPin, History } from 'lucide-react';

export default function SearchNav() {
  const tabs = [
    { label: 'All', path: '/search', icon: Search, end: true },
    { label: 'People', path: '/search/people', icon: Users },
    { label: 'Posts', path: '/search/posts', icon: Image },
    { label: 'Hashtags', path: '/search/hashtags', icon: Hash },
    { label: 'Places', path: '/search/places', icon: MapPin },
    { label: 'Recent', path: '/search/recent', icon: History }
  ];

  return (
    <div className="w-full max-w-xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar gap-1 bg-neutral-900/80 backdrop-blur border border-neutral-800 rounded-full p-1.5 px-3 mb-6">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.path}
            to={tab.path}
            end={tab.end}
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`
            }
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </NavLink>
        );
      })}
    </div>
  );
}
