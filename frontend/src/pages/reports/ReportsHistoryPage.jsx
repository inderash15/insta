import React, { useState, useEffect } from 'react';
import { FileText, ShieldCheck, Clock, CheckCircle2, AlertOctagon, Loader2, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function ReportsHistoryPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyReports = async () => {
      setLoading(true);
      try {
        const res = await api.get('/reports/my');
        if (res.data?.success) {
          setReports(res.data.reports || []);
        }
      } catch (err) {
        console.error('Failed to load user reports:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyReports();
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto py-6 px-4 space-y-6">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/safety')}
            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base font-bold text-neutral-100">My Reports</h1>
            <p className="text-xs text-neutral-400">Track moderation decisions on your reported tickets</p>
          </div>
        </div>

        <Link
          to="/reports/new"
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-semibold hover:opacity-90 transition-opacity"
        >
          New Report
        </Link>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-6 h-6 text-pink-500 animate-spin" />
        </div>
      ) : reports.length === 0 ? (
        <div className="py-20 text-center space-y-2 text-neutral-500 text-xs">
          <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 mx-auto flex items-center justify-center text-neutral-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <p className="font-semibold text-neutral-300">No reports filed</p>
          <p>You haven&apos;t submitted any content reports yet. If you see something unsafe, report it.</p>
        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl divide-y divide-neutral-800/60 overflow-hidden">
          {reports.map((r) => (
            <div key={r._id} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-200 capitalize">
                  {r.targetType} Report: {r.reason?.replace(/_/g, ' ')}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    r.status === 'resolved'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : r.status === 'dismissed'
                      ? 'bg-neutral-800 text-neutral-400'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {r.status || 'Pending'}
                </span>
              </div>
              {r.description && <p className="text-xs text-neutral-300">{r.description}</p>}
              <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-1">
                <span>Ticket: {r._id}</span>
                <span>Submitted {new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
