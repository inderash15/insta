import React, { useState, useEffect } from 'react';
import { FileText, Shield, Clock, Loader2, ArrowRight } from 'lucide-react';
import api from '../../services/api';

export default function AdminAuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAudit = async () => {
      setLoading(true);
      try {
        const res = await api.get('/admin/audit');
        if (res.data?.success) {
          setLogs(res.data.auditLogs || []);
        }
      } catch (err) {
        console.error('Failed to load audit logs:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAudit();
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b border-neutral-800 pb-4">
        <h1 className="text-xl font-bold text-neutral-100 flex items-center gap-2.5">
          <FileText className="w-6 h-6 text-sky-400" />
          <span>Privileged Action Audit Log</span>
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Immutable trail of administrative sanctions, role updates, and moderation resolutions
        </p>
      </div>

      {loading ? (
        <div className="py-24 flex justify-center">
          <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <div className="py-20 text-center space-y-2 text-neutral-500 text-xs">
          <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 mx-auto flex items-center justify-center text-neutral-400">
            <Shield className="w-6 h-6" />
          </div>
          <p className="font-semibold text-neutral-300">Audit Log is Empty</p>
          <p>Actions performed by administrators or moderators will be permanently recorded here.</p>
        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl divide-y divide-neutral-800/60 overflow-hidden shadow-lg">
          {logs.map((log) => (
            <div key={log._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    {log.action}
                  </span>
                  <span className="text-xs font-semibold text-neutral-200">
                    Target: {log.targetType} ({log.targetId})
                  </span>
                </div>
                {log.details && (
                  <p className="text-[11px] text-neutral-400 font-mono">
                    {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details}
                  </p>
                )}
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs text-neutral-300 block">
                  Admin: @{log.performedBy?.username || 'admin'}
                </span>
                <span className="text-[10px] text-neutral-500">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
