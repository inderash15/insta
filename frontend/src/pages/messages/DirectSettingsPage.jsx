import React, { useState, useEffect } from 'react';
import { Settings, Shield, Bell, Check, Loader2, AlertCircle } from 'lucide-react';
import DirectNav from '../../components/messages/DirectNav';
import api from '../../services/api';

export default function DirectSettingsPage() {
  const [allowFrom, setAllowFrom] = useState('everyone');
  const [readReceipts, setReadReceipts] = useState(true);
  const [activeStatus, setActiveStatus] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const res = await api.get('/settings/preferences');
        if (res.data?.success && res.data.preferences?.privacy) {
          setActiveStatus(res.data.preferences.privacy.activityStatus ?? true);
        }
      } catch {}
    };
    fetchPrefs();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await api.put('/settings/preferences', {
        privacy: {
          activityStatus: activeStatus
        }
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save direct settings:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto py-6 px-4 space-y-6">
      <DirectNav />

      <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
        <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-base font-bold text-neutral-100">Direct Message Settings</h1>
          <p className="text-xs text-neutral-400">Control who can message you and manage delivery preferences</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-4">
          <h2 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
            Who Can Message You
          </h2>

          <div className="space-y-2">
            {[
              { id: 'everyone', label: 'Everyone on Insta', desc: 'Anyone can send message requests' },
              { id: 'following', label: 'People You Follow', desc: 'Only accounts you follow can message you' }
            ].map((opt) => (
              <label
                key={opt.id}
                className="flex items-start gap-3 p-3 rounded-xl border border-neutral-800 hover:bg-neutral-800/40 cursor-pointer"
              >
                <input
                  type="radio"
                  name="allowFrom"
                  value={opt.id}
                  checked={allowFrom === opt.id}
                  onChange={() => setAllowFrom(opt.id)}
                  className="mt-1 accent-pink-500"
                />
                <div>
                  <p className="text-xs font-semibold text-neutral-200">{opt.label}</p>
                  <p className="text-[11px] text-neutral-400">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-4">
          <h2 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
            Privacy & Status
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-neutral-200">Read Receipts</p>
                <p className="text-[11px] text-neutral-400">Others can see when you have read their messages</p>
              </div>
              <input
                type="checkbox"
                checked={readReceipts}
                onChange={() => setReadReceipts(!readReceipts)}
                className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between border-t border-neutral-800 pt-3">
              <div>
                <p className="text-xs font-semibold text-neutral-200">Show Activity Status</p>
                <p className="text-[11px] text-neutral-400">Allow accounts you follow to see when you were last active</p>
              </div>
              <input
                type="checkbox"
                checked={activeStatus}
                onChange={() => setActiveStatus(!activeStatus)}
                className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
              />
            </div>
          </div>
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
          ) : saved ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Settings Saved!</span>
            </>
          ) : (
            <span>Save Preferences</span>
          )}
        </button>
      </form>
    </div>
  );
}
