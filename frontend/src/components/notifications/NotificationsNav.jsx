import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Bell, Users, Heart, MessageCircle, AtSign, MessageSquare, Clock, History } from 'lucide-react';

export default function NotificationsNav() {
  const tabs = [
    { label: 'All', path: '/notifications', icon: Bell, end: true },
    { label: 'Following', path: '/notifications/following', icon: Users },
    { label: 'Likes', path: '/notifications/posts', icon: Heart },
    { label: 'Comments', path: '/notifications/comments', icon: MessageCircle },
    { label: 'Mentions', path: '/notifications/mentions', icon: AtSign },
    { label: 'Messages', path: '/notifications/messages', icon: MessageSquare },
    { label: 'Requests', path: '/notifications/requests', icon: Clock }
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
        to="/activity"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white transition-colors shrink-0"
      >
        <History className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Activity</span>
      </Link>
    </div>
  );
}
