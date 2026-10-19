import React, { useState, useEffect } from 'react';
import { Laptop, Smartphone, Trash2, Shield, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import SettingsLayoutWrapper from '../../components/settings/SettingsLayoutWrapper';
import api from '../../services/api';

export default function SettingsSessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/settings/sessions');
      if (res.data?.success) {
        setSessions(res.data.sessions || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load active sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevoke = async (sessionId) => {
    try {
      await api.delete(`/settings/sessions/${sessionId}`);
      setSessions((prev) => prev.filter((s) => s._id !== sessionId));
      setMessage('Session successfully revoked.');
      setTimeout(() => setMessage(''), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to revoke session');
    }
  };

  return (
    <SettingsLayoutWrapper
      title="Active Sessions"
      subtitle="Inspect and manage recognized browsers and devices logged into your account"
    >
      {message && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-400 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-6 h-6 text-pink-500 animate-spin" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-100">Current Web Session (Active Now)</p>
              <p className="text-[11px] text-neutral-400">Windows &bull; Chrome / Edge &bull; 127.0.0.1</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            This Device
          </span>
        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl divide-y divide-neutral-800/60 overflow-hidden">
          {sessions.map((s, idx) => (
            <div key={s._id || idx} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-neutral-800 text-neutral-300">
                  <Laptop className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-200">
                    {s.deviceName || 'Web Session'}
                  </p>
                  <p className="text-[10px] text-neutral-500">
                    IP: {s.ipAddress || '127.0.0.1'} &bull; Last seen: {new Date(s.lastActive || Date.now()).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRevoke(s._id)}
                className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Revoke</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </SettingsLayoutWrapper>
  );
}
