import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Check, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ConfirmAccountPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="w-full max-w-sm space-y-4">
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-8 space-y-6 shadow-xl text-center">
        <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-pink-500 mx-auto shadow-inner">
          <ShieldCheck className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-xl font-bold tracking-tight text-white">Confirm Your Account</h1>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Please confirm your agreement to Insta community safety policies and secure identity verification rules.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 text-left text-xs text-neutral-300 space-y-2.5">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 rounded border-neutral-700 bg-neutral-800 text-pink-500 focus:ring-0"
            />
            <span className="text-[11px] leading-relaxed">
              I agree to comply with Insta's Community Guidelines, anti-harassment policies, and authentic identity rules.
            </span>
          </label>
        </div>

        <button
          onClick={() => navigate('/home')}
          disabled={!agreed}
          className="w-full py-2.5 px-4 insta-story-gradient hover:opacity-95 disabled:opacity-40 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20"
        >
          <span>Complete Confirmation</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="pt-2 text-center text-[11px] text-neutral-500">
          Account ID: <span className="font-mono text-neutral-400">@{user?.username || 'user'}</span>
        </div>
      </div>
    </div>
  );
}
