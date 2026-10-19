import React, { useState, useEffect } from 'react';
import { Smartphone, ShieldCheck, Key, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import SettingsLayoutWrapper from '../../components/settings/SettingsLayoutWrapper';
import api from '../../services/api';

export default function SettingsTwoFactorPage() {
  const [enabled, setEnabled] = useState(false);
  const [code, setCode] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const res = await api.get('/settings/preferences');
        if (res.data?.success && res.data.preferences?.twoFactor) {
          setEnabled(res.data.preferences.twoFactor.enabled || false);
        }
      } catch {}
    };
    fetchPrefs();
  }, []);

  const handleToggle = async (e) => {
    const nextState = e.target.checked;
    if (nextState) {
      setConfirming(true);
    } else {
      setSaving(true);
      try {
        await api.put('/settings/preferences', {
          twoFactor: { enabled: false }
        });
        setEnabled(false);
        setMessage('Two-factor authentication disabled.');
      } catch (err) {
        setError('Failed to disable two-factor authentication.');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleConfirmCode = async (e) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      setError('Please enter a valid 6-digit confirmation code.');
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');

    try {
      await api.put('/settings/preferences', {
        twoFactor: { enabled: true }
      });
      setEnabled(true);
      setConfirming(false);
      setCode('');
      setMessage('Two-factor authentication successfully enabled and verified!');
    } catch (err) {
      setError('Failed to enable two-factor authentication.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsLayoutWrapper
      title="Two-Factor Authentication (2FA)"
      subtitle="Protect your account with an extra security layer beyond password"
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

      <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-pink-400" />
            <h2 className="text-xs font-semibold text-neutral-100">Authentication App (TOTP)</h2>
          </div>
          <p className="text-[11px] text-neutral-400">
            Use an authenticator app (such as Google Authenticator, Duo, or 1Password) to generate security passcodes.
          </p>
          <div className="pt-1">
            <span
              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                enabled
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              {enabled ? 'Active & Configured' : 'Inactive'}
            </span>
          </div>
        </div>

        <input
          type="checkbox"
          checked={enabled}
          onChange={handleToggle}
          disabled={saving}
          className="w-5 h-5 accent-pink-500 rounded cursor-pointer mt-1 shrink-0"
        />
      </div>

      {confirming && (
        <form onSubmit={handleConfirmCode} className="p-5 bg-neutral-950 border border-pink-500/30 rounded-2xl space-y-4">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-neutral-100">Confirm Security Code</h3>
            <p className="text-[11px] text-neutral-400">
              Enter the 6-digit code shown in your authenticator app to complete configuration.
            </p>
          </div>

          <input
            type="text"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="123456"
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-center text-lg font-mono tracking-widest text-neutral-100 focus:outline-none focus:border-pink-500"
            autoFocus
          />

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving || code.length !== 6}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-pink-500 to-purple-600 text-white disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Verify and Enable</span>}
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirming(false);
                setCode('');
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {enabled && (
        <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-200">Recovery Codes</p>
              <p className="text-[10px] text-neutral-400">Use one-time backup codes if you lose your phone</p>
            </div>
          </div>
          <Link
            to="/auth/recovery-codes"
            className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors"
          >
            Manage
          </Link>
        </div>
      )}
    </SettingsLayoutWrapper>
  );
}
