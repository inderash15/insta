import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Check, 
  X, 
  Trash2, 
  ShieldCheck, 
  Loader2, 
  ExternalLink 
} from 'lucide-react';
import api from '../../services/api';

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/reports');
      if (res.data?.success) {
        setReports(res.data.reports || []);
      }
    } catch (err) {
      console.error('Failed to load reports queue:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResolve = async (reportId, status, deleteTarget = false) => {
    setActionLoading(reportId);
    try {
      const res = await api.patch(`/admin/reports/${reportId}`, {
        status,
        deleteTarget
      });
      if (res.data?.success) {
        setReports((prev) =>
          prev.map((r) => (r._id === reportId ? { ...r, status } : r))
        );
      }
    } catch (err) {
      console.error('Failed to resolve report:', err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-neutral-800 pb-4">
        <h1 className="text-xl font-bold text-neutral-100 flex items-center gap-2.5">
          <AlertTriangle className="w-6 h-6 text-amber-500" />
          <span>Moderation Queue</span>
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Review community reports, remove violating publications, and sanction abusive accounts
        </p>
      </div>

      {loading ? (
        <div className="py-24 flex justify-center">
          <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
        </div>
      ) : reports.length === 0 ? (
        <div className="py-24 text-center space-y-2 text-neutral-500 text-xs">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <p className="font-semibold text-neutral-300">Queue is Clear!</p>
          <p>No unresolved moderation tickets currently require attention.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => {
            const isBusy = actionLoading === r._id;
            return (
              <div
                key={r._id}
                className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {r.targetType}
                    </span>
                    <span className="text-xs font-bold text-neutral-100 capitalize">
                      {r.reason?.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">ID: {r.targetId}</span>
                  </div>

                  {r.description && (
                    <p className="text-xs text-neutral-300 italic">
                      &ldquo;{r.description}&rdquo;
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-[10px] text-neutral-500 pt-1">
                    <span>Reported by: @{r.reporter?.username || 'user'}</span>
                    <span>Status: {r.status}</span>
                    <span>Date: {new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {r.status === 'pending' ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleResolve(r._id, 'dismissed')}
                      disabled={isBusy}
                      className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Dismiss</span>
                    </button>

                    <button
                      onClick={() => handleResolve(r._id, 'resolved', false)}
                      disabled={isBusy}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Resolve</span>
                    </button>

                    <button
                      onClick={() => handleResolve(r._id, 'resolved', true)}
                      disabled={isBusy}
                      className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                      title="Resolve and delete target content from database"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Target</span>
                    </button>
                  </div>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-neutral-800 text-neutral-400">
                    {r.status}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
