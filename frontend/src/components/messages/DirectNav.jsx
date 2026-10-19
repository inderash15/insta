import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { MessageSquare, UserCheck, Star, Archive, Settings, Edit } from 'lucide-react';

export default function DirectNav() {
  const tabs = [
    { label: 'Inbox', path: '/direct', icon: MessageSquare, end: true },
    { label: 'Requests', path: '/direct/requests', icon: UserCheck },
    { label: 'Starred', path: '/direct/starred', icon: Star },
    { label: 'Archived', path: '/direct/archived', icon: Archive },
    { label: 'Settings', path: '/direct/settings', icon: Settings }
  ];

  return (
    <div className="w-full flex items-center justify-between border-b border-neutral-800 pb-3 mb-4 gap-2">
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.end}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-neutral-800 text-pink-400 font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                }`
              }
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </NavLink>
          );
        })}
      </div>

      <Link
        to="/direct/new"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-90 transition-opacity shrink-0"
      >
        <Edit className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">New Chat</span>
      </Link>
    </div>
  );
}
