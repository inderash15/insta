import React from 'react';
import { NavLink } from 'react-router-dom';
import { Compass, Users, Layers, Sparkles } from 'lucide-react';

export default function ExploreNav() {
  const tabs = [
    { label: 'Explore Grid', path: '/explore', icon: Compass, end: true },
    { label: 'Discover People', path: '/explore/people', icon: Users },
    { label: 'Topics', path: '/explore/topics', icon: Layers }
  ];

  return (
    <div className="w-full max-w-md mx-auto flex items-center justify-between bg-neutral-900/80 backdrop-blur border border-neutral-800 rounded-full p-1.5 px-3 mb-6">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.path}
            to={tab.path}
            end={tab.end}
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
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
