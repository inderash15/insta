import React, { useState } from 'react';
import { User, Mail, Shield, Calendar, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import SettingsLayoutWrapper from '../../components/settings/SettingsLayoutWrapper';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function SettingsAccountPage() {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [gender, setGender] = useState(user?.gender || 'not_specified');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      await api.put('/users/profile', {
        email,
        phone,
        gender
      });
      setMessage('Account details saved successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update account details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsLayoutWrapper
      title="Account Center"
      subtitle="Manage personal credentials, registered email, and security identities"
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

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Registered Username</label>
          <input
            type="text"
            value={user?.username || ''}
            disabled
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-400 cursor-not-allowed"
          />
          <p className="text-[10px] text-neutral-500 mt-1">Username changes require identity verification.</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-pink-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Phone Number (Optional)</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (555) 000-0000"
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-pink-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-neutral-100 focus:outline-none focus:border-pink-500 transition-colors"
          >
            <option value="not_specified">Prefer not to say</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="non_binary">Non-binary</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div className="pt-2 border-t border-neutral-800 flex justify-between items-center text-xs text-neutral-400">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Joined on {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</span>
          </div>
          <span className="font-semibold uppercase text-[10px] tracking-wide text-neutral-500">
            Role: {user?.role || 'User'}
          </span>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-2.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <span>Save Account Information</span>
          )}
        </button>
      </form>
    </SettingsLayoutWrapper>
  );
}
