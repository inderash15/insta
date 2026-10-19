import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/common/PageHeader';
import { Palette, Check } from 'lucide-react';

export default function ProfileCoverPage() {
  const { user } = useAuth();
  const [selectedTheme, setSelectedTheme] = useState('gradient-sunset');
  const [saved, setSaved] = useState(false);

  const themeOptions = [
    { id: 'gradient-sunset', name: 'Sunset Glow', bg: 'from-pink-500 via-rose-500 to-amber-500' },
    { id: 'gradient-neon', name: 'Cyber Neon', bg: 'from-purple-600 via-pink-600 to-blue-600' },
    { id: 'gradient-emerald', name: 'Emerald Coast', bg: 'from-emerald-500 via-teal-600 to-cyan-700' },
    { id: 'gradient-midnight', name: 'Midnight Shadow', bg: 'from-neutral-900 via-neutral-800 to-neutral-950' }
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-xl mx-auto py-6 px-4 space-y-6 text-neutral-100">
      <PageHeader
        title="Profile Appearance"
        subtitle="Customize header banners, story badge highlights, and personal accent gradients."
        showBack
      />

      {saved && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-900/60 text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Profile theme updated!</span>
        </div>
      )}

      {/* Live Preview */}
      <div className="rounded-3xl border border-neutral-800 bg-neutral-900/40 overflow-hidden shadow-xl">
        <div className={`h-32 bg-gradient-to-r ${themeOptions.find((t) => t.id === selectedTheme)?.bg}`} />
        <div className="p-4 sm:p-6 -mt-12 flex items-end gap-4">
          <div className="w-20 h-20 rounded-full border-4 border-neutral-950 overflow-hidden bg-neutral-800 shrink-0">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-lg text-white">
                {user?.username?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div className="pb-1 min-w-0">
            <h3 className="font-bold text-white text-base truncate">{user?.fullName}</h3>
            <p className="text-xs text-neutral-400">@{user?.username}</p>
          </div>
        </div>
      </div>

      {/* Theme Picker */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Choose Theme Preset</h3>
        <div className="grid grid-cols-2 gap-3">
          {themeOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedTheme(opt.id)}
              className={`p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                selectedTheme === opt.id
                  ? 'border-pink-500 bg-neutral-900 shadow-md'
                  : 'border-neutral-800 bg-neutral-950/50 hover:bg-neutral-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${opt.bg} shrink-0`} />
                <span className="text-xs font-semibold text-white">{opt.name}</span>
              </div>
              {selectedTheme === opt.id && <Check className="w-4 h-4 text-pink-400" />}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full py-3 px-4 rounded-2xl insta-story-gradient text-white text-xs font-semibold shadow-lg shadow-pink-500/20 hover:opacity-95 transition"
      >
        Save Theme
      </button>
    </div>
  );
}
