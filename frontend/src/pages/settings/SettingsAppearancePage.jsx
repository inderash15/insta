import React, { useState, useEffect } from 'react';
import { SunMoon, Moon, Sun, Monitor, CheckCircle2, Loader2 } from 'lucide-react';
import SettingsLayoutWrapper from '../../components/settings/SettingsLayoutWrapper';
import api from '../../services/api';

export default function SettingsAppearancePage() {
  const [theme, setTheme] = useState('dark');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const res = await api.get('/settings/preferences');
        if (res.data?.success && res.data.preferences?.theme) {
          setTheme(res.data.preferences.theme);
        }
      } catch {}
    };
    fetchPrefs();
  }, []);

  const handleSelectTheme = async (selected) => {
    setTheme(selected);
    setSaving(true);
    setSaved(false);

    try {
      await api.put('/settings/preferences', { theme: selected });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to update theme:', err);
    } finally {
      setSaving(false);
    }
  };

  const themes = [
    { id: 'dark', label: 'Dark Mode', desc: 'Sleek obsidian palette optimal for low light', icon: Moon },
    { id: 'light', label: 'Light Mode', desc: 'High brightness palette for daytime clarity', icon: Sun },
    { id: 'system', label: 'System Default', desc: 'Syncs automatically with your OS preference', icon: Monitor }
  ];

  return (
    <SettingsLayoutWrapper
      title="Appearance & Themes"
      subtitle="Customize visual presentation and interface color modes"
    >
      {saved && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-400 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Theme updated successfully!</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {themes.map((t) => {
          const Icon = t.icon;
          const isSelected = theme === t.id;
          return (
            <div
              key={t.id}
              onClick={() => handleSelectTheme(t.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-36 ${
                isSelected
                  ? 'bg-neutral-900 border-pink-500 shadow-lg shadow-pink-500/10'
                  : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-xl ${isSelected ? 'bg-pink-500 text-white' : 'bg-neutral-800 text-neutral-300'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <input
                  type="radio"
                  name="theme"
                  checked={isSelected}
                  onChange={() => handleSelectTheme(t.id)}
                  className="accent-pink-500"
                />
              </div>

              <div>
                <p className="text-xs font-bold text-neutral-100">{t.label}</p>
                <p className="text-[10px] text-neutral-400 mt-0.5">{t.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </SettingsLayoutWrapper>
  );
}
