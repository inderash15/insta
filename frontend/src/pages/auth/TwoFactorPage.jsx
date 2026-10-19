import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, KeyRound, Loader2, ArrowLeft } from 'lucide-react';

export default function TwoFactorPage() {
  const navigate = useNavigate();
  const [totp, setTotp] = useState('');
  const [useBackup, setUseBackup] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!totp.trim()) return;

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      // Simulate successful 2FA code verification
      if (totp.trim().length >= 6) {
        navigate('/home');
      } else {
        setError('Invalid security code. Please check your authenticator app.');
      }
    }, 600);
  };

  return (
    <div className="w-full max-w-sm space-y-4">
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-8 space-y-6 shadow-xl text-center">
        <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-pink-500 mx-auto shadow-inner">
          {useBackup ? <KeyRound className="w-7 h-7" /> : <Shield className="w-7 h-7" />}
        </div>

        <div className="space-y-1.5">
          <h1 className="text-xl font-bold tracking-tight text-white">
            {useBackup ? 'Use Recovery Code' : 'Two-Factor Authentication'}
          </h1>
          <p className="text-xs text-neutral-400 leading-relaxed">
            {useBackup
              ? 'Enter an unused 8-digit emergency recovery code from your security settings.'
              : 'Enter the 6-digit verification code from your authenticator application.'}
          </p>
        </div>

        {error && (
          <p className="text-xs text-red-400 bg-red-950/40 border border-red-900/60 p-2.5 rounded-xl">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder={useBackup ? 'e.g. 8492-4910' : '000 000'}
            maxLength={useBackup ? 12 : 6}
            value={totp}
            onChange={(e) => {
              setTotp(e.target.value);
              setError('');
            }}
            className="w-full py-3 px-4 text-center tracking-widest text-lg font-mono rounded-xl bg-neutral-900 border border-neutral-800 focus:border-pink-500 focus:outline-none text-white"
          />

          <button
            type="submit"
            disabled={submitting || !totp.trim()}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Confirm & Log In</span>}
          </button>
        </form>

        <div className="pt-2 border-t border-neutral-800 flex flex-col gap-2 text-xs">
          <button
            type="button"
            onClick={() => {
              setUseBackup(!useBackup);
              setTotp('');
              setError('');
            }}
            className="text-blue-500 hover:text-blue-400 font-medium transition"
          >
            {useBackup ? 'Use Authenticator Code instead' : 'Lost device? Use emergency recovery code'}
          </button>

          <Link
            to="/auth/login"
            className="text-neutral-500 hover:text-neutral-300 transition flex items-center justify-center gap-1 mt-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cancel and back to login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
