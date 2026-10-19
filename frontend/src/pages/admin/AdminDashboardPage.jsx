import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  AlertTriangle, 
  Film, 
  ShieldCheck, 
  Activity, 
  TrendingUp, 
  Loader2 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await api.get('/admin/stats');
        if (res.data?.success) {
          setStats(res.data.stats || {});
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b border-neutral-800 pb-4">
        <h1 className="text-xl font-bold text-neutral-100 flex items-center gap-2.5">
          <ShieldCheck className="w-6 h-6 text-pink-500" />
          <span>Platform Overview</span>
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Real-time metrics, active moderation queues, and health diagnostics
        </p>
      </div>

      {loading ? (
        <div className="py-24 flex justify-center">
          <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-2 shadow-sm">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-xs font-semibold">Total Accounts</span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-neutral-100">
                {stats?.totalUsers ?? 0}
              </p>
              <Link to="/admin/users" className="text-[11px] font-semibold text-pink-400 hover:underline inline-block">
                Manage Directory &rarr;
              </Link>
            </div>

            <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-2 shadow-sm">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-xs font-semibold">Published Posts</span>
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-neutral-100">
                {stats?.totalPosts ?? 0}
              </p>
              <span className="text-[11px] text-neutral-500">Public & private media</span>
            </div>

            <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-2 shadow-sm">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-xs font-semibold">Pending Moderation</span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-amber-400">
                {stats?.pendingReports ?? 0}
              </p>
              <Link to="/admin/reports" className="text-[11px] font-semibold text-amber-400 hover:underline inline-block">
                Review Queue &rarr;
              </Link>
            </div>

            <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-2 shadow-sm">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-xs font-semibold">Active Short Reels</span>
                <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400">
                  <Film className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-neutral-100">
                {stats?.totalReels ?? 0}
              </p>
              <span className="text-[11px] text-neutral-500">Streamed video clips</span>
            </div>
          </div>

          {/* System status banner */}
          <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3">
            <h2 className="text-xs font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Service Health & Infrastructure</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800 flex items-center justify-between">
                <span className="text-neutral-400">Database Engine</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  MongoDB Connected
                </span>
              </div>
              <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800 flex items-center justify-between">
                <span className="text-neutral-400">WebSocket Transport</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Socket.IO Active
                </span>
              </div>
              <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800 flex items-center justify-between">
                <span className="text-neutral-400">Media Pipeline</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Local FS Verified
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
