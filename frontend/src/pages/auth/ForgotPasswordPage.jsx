import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import FormField from '../../components/common/FormField';

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please provide your username or email');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      // In local dev/mock, simulate sending recovery token
      await new Promise((r) => setTimeout(r, 600));
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to dispatch recovery link.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-sm space-y-4">
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-8 space-y-6 shadow-xl">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-pink-500 shadow-inner">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Trouble logging in?</h1>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Enter your email or username and we'll send you a link to reset your account credentials.
          </p>
        </div>

        {success ? (
          <div className="space-y-4 text-center">
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-900/60 text-emerald-300 text-xs flex flex-col items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <span>Recovery link sent to your registered email address.</span>
            </div>
            <Link
              to="/auth/reset-password?token=demo_token"
              className="inline-block text-xs font-semibold text-blue-500 hover:text-blue-400 transition"
            >
              Simulate opening reset link with token →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-900/60 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <FormField
              id="forgot-identifier"
              label="Email, phone, or username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={submitting}
              required
            />

            <button
              type="submit"
              disabled={submitting || !identifier.trim()}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending link...</span>
                </>
              ) : (
                <span>Send Login Link</span>
              )}
            </button>
          </form>
        )}

        <div className="pt-2 border-t border-neutral-800 text-center">
          <Link
            to="/auth/login"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
