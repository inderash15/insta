import React, { useState, useEffect } from 'react';
import { History, Heart, Clock, Search, ShieldCheck, ArrowRight, Activity, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import NotificationsNav from '../../components/notifications/NotificationsNav';
import { useAuth } from '../../context/AuthContext';

export default function ActivityHistoryPage() {
  const { user } = useAuth();
  const [recents, setRecents] = useState([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('insta_recent_searches') || '[]');
      setRecents(stored);
    } catch {
      setRecents([]);
    }
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto py-6 px-4 space-y-6">
      <NotificationsNav />

      <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
        <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-base font-bold text-neutral-100">Your Activity</h1>
          <p className="text-xs text-neutral-400">Review and manage your interactions across Insta</p>
        </div>
      </div>

      {/* Quick summary grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link
          to="/feed/liked"
          className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl hover:border-pink-500/40 transition-colors space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400">
              <Heart className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-pink-400 group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-neutral-200">Likes & Interactions</h3>
            <p className="text-[11px] text-neutral-400">Review posts you have liked</p>
          </div>
        </Link>

        <Link
          to="/search/recent"
          className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl hover:border-pink-500/40 transition-colors space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <Search className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-pink-400 group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-neutral-200">Search History</h3>
            <p className="text-[11px] text-neutral-400">{recents.length} recent queries</p>
          </div>
        </Link>

        <Link
          to="/settings/sessions"
          className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl hover:border-pink-500/40 transition-colors space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-pink-400 group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-neutral-200">Security & Logins</h3>
            <p className="text-[11px] text-neutral-400">View active login sessions</p>
          </div>
        </Link>
      </div>

      {/* Account creation metadata */}
      <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-2xl space-y-3">
        <h2 className="text-xs font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-neutral-400" />
          <span>Account History</span>
        </h2>
        <div className="text-xs text-neutral-300 space-y-2">
          <div className="flex justify-between py-1.5 border-b border-neutral-800/60">
            <span className="text-neutral-400">Registered Username</span>
            <span className="font-semibold">@{user?.username}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-neutral-800/60">
            <span className="text-neutral-400">Account Type</span>
            <span className="font-semibold capitalize">{user?.role || 'Standard Member'}</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-neutral-400">Member Since</span>
            <span className="font-semibold">{new Date(user?.createdAt || Date.now()).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
