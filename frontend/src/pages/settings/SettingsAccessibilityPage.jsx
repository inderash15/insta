import React, { useState, useEffect } from 'react';
import { Eye, Contrast, Zap, Play, CheckCircle2, Loader2 } from 'lucide-react';
import SettingsLayoutWrapper from '../../components/settings/SettingsLayoutWrapper';
import api from '../../services/api';

export default function SettingsAccessibilityPage() {
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [autoplayVideo, setAutoplayVideo] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const res = await api.get('/settings/preferences');
        if (res.data?.success && res.data.preferences?.accessibility) {
          const a = res.data.preferences.accessibility;
          if (a.highContrast !== undefined) setHighContrast(a.highContrast);
          if (a.reduceMotion !== undefined) setReduceMotion(a.reduceMotion);
          if (a.autoplayVideo !== undefined) setAutoplayVideo(a.autoplayVideo);
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
        accessibility: {
          highContrast,
          reduceMotion,
          autoplayVideo
        }
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to update accessibility settings:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsLayoutWrapper
      title="Accessibility Preferences"
      subtitle="Configure motion, contrast, and media playback to match your personal needs"
    >
      {saved && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-400 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Accessibility preferences saved!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl divide-y divide-neutral-800/60 overflow-hidden">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                <Contrast className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-200">High Contrast Mode</p>
                <p className="text-[11px] text-neutral-400">Enhance borders and sharpen text distinction</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={highContrast}
              onChange={(e) => setHighContrast(e.target.checked)}
              className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
            />
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-200">Reduce Motion & Animations</p>
                <p className="text-[11px] text-neutral-400">Minimize transitions, spin effects, and decorative sweeps</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={reduceMotion}
              onChange={(e) => setReduceMotion(e.target.checked)}
              className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
            />
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400">
                <Play className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-200">Autoplay Videos & Reels</p>
                <p className="text-[11px] text-neutral-400">Automatically play short-form clips when scrolled into view</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={autoplayVideo}
              onChange={(e) => setAutoplayVideo(e.target.checked)}
              className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
            />
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
          ) : (
            <span>Save Accessibility Settings</span>
          )}
        </button>
      </form>
    </SettingsLayoutWrapper>
  );
}
