import React, { useState, useEffect } from 'react';
import { Globe, CheckCircle2, Loader2 } from 'lucide-react';
import SettingsLayoutWrapper from '../../components/settings/SettingsLayoutWrapper';
import api from '../../services/api';

const LANGUAGES = [
  { code: 'en', name: 'English (US)', localName: 'English (US)' },
  { code: 'es', name: 'Spanish', localName: 'Español' },
  { code: 'fr', name: 'French', localName: 'Français' },
  { code: 'de', name: 'German', localName: 'Deutsch' },
  { code: 'ja', name: 'Japanese', localName: '日本語' },
  { code: 'pt', name: 'Portuguese', localName: 'Português' },
  { code: 'zh', name: 'Chinese (Simplified)', localName: '简体中文' },
  { code: 'hi', name: 'Hindi', localName: 'हिन्दी' },
  { code: 'ar', name: 'Arabic', localName: 'العربية' }
];

export default function SettingsLanguagePage() {
  const [language, setLanguage] = useState('en');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const res = await api.get('/settings/preferences');
        if (res.data?.success && res.data.preferences?.language) {
          setLanguage(res.data.preferences.language);
        }
      } catch {}
    };
    fetchPrefs();
  }, []);

  const handleSelectLanguage = async (code) => {
    setLanguage(code);
    setSaving(true);
    setSaved(false);

    try {
      await api.put('/settings/preferences', { language: code });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to update language:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsLayoutWrapper
      title="Language Preferences"
      subtitle="Choose the language you use for buttons, titles, and system notices"
    >
      {saved && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-400 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Language updated successfully!</span>
        </div>
      )}

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl divide-y divide-neutral-800/60 overflow-hidden">
        {LANGUAGES.map((l) => {
          const isSelected = language === l.code;
          return (
            <div
              key={l.code}
              onClick={() => handleSelectLanguage(l.code)}
              className="p-3.5 flex items-center justify-between hover:bg-neutral-800/40 transition-colors cursor-pointer"
            >
              <div>
                <p className={`text-xs font-semibold ${isSelected ? 'text-pink-400' : 'text-neutral-200'}`}>
                  {l.name}
                </p>
                <p className="text-[11px] text-neutral-400">{l.localName}</p>
              </div>
              <input
                type="radio"
                name="language"
                checked={isSelected}
                onChange={() => handleSelectLanguage(l.code)}
                className="accent-pink-500"
              />
            </div>
          );
        })}
      </div>
    </SettingsLayoutWrapper>
  );
}
