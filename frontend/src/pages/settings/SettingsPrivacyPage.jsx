import React, { useState, useEffect } from 'react';
import { Shield, Lock, Eye, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import SettingsLayoutWrapper from '../../components/settings/SettingsLayoutWrapper';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function SettingsPrivacyPage() {
  const { user } = useAuth();
  const [isPrivate, setIsPrivate] = useState(user?.isPrivate || false);
  const [activityStatus, setActivityStatus] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const res = await api.get('/settings/preferences');
        if (res.data?.success && res.data.preferences?.privacy) {
          setActivityStatus(res.data.preferences.privacy.activityStatus ?? true);
        }
      } catch {}
    };
    fetchPrefs();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      await Promise.all([
        api.put('/users/profile', { isPrivate }),
        api.put('/settings/preferences', {
          privacy: { activityStatus }
        })
      ]);
      setMessage('Privacy settings updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update privacy settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsLayoutWrapper
      title="Account Privacy"
      subtitle="Manage audience visibility, private account mode, and activity status"
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

      <form onSubmit={handleSave} className="space-y-5">
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-pink-400" />
              <h2 className="text-xs font-semibold text-neutral-100">Private Account</h2>
            </div>
            <p className="text-[11px] text-neutral-400">
              When your account is private, only people you approve can see your photos, reels, and stories. Your existing followers won&apos;t be affected.
            </p>
          </div>
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="w-5 h-5 accent-pink-500 rounded cursor-pointer mt-0.5 shrink-0"
          />
        </div>

        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-400" />
              <h2 className="text-xs font-semibold text-neutral-100">Show Activity Status</h2>
            </div>
            <p className="text-[11px] text-neutral-400">
              Allow accounts you follow and anyone you message to see when you were last active or are currently active on Insta.
            </p>
          </div>
          <input
            type="checkbox"
            checked={activityStatus}
            onChange={(e) => setActivityStatus(e.target.checked)}
            className="w-5 h-5 accent-pink-500 rounded cursor-pointer mt-0.5 shrink-0"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-2.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Preferences...</span>
            </>
          ) : (
            <span>Save Privacy Preferences</span>
          )}
        </button>
      </form>
    </SettingsLayoutWrapper>
  );
}
