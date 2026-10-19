import React, { useState } from 'react';
import { Instagram, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import FormField from '../../components/common/FormField';

export default function LoginPage({ onSwitchToSignup }) {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!identifier.trim()) {
      errs.identifier = 'Username or email is required';
    }
    if (!password) {
      errs.password = 'Password is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setServerError('');
    if (!validate()) return;

    try {
      setSubmitting(true);
      await login(identifier.trim(), password);
    } catch (err) {
      setServerError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-sm space-y-4">
      {/* Primary Login Card */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-8 space-y-6 shadow-xl">
        {/* Brand Header */}
        <div className="flex flex-col items-center space-y-2">
          <div className="w-12 h-12 rounded-2xl insta-story-gradient p-0.5 flex items-center justify-center shadow-lg shadow-pink-500/20">
            <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center">
              <Instagram className="w-6 h-6 text-pink-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-100">Insta</h1>
          <p className="text-xs text-neutral-400">Log in to connect with friends</p>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="bg-red-950/40 border border-red-900/60 rounded-lg p-3 flex items-start gap-2.5 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <FormField
            id="login-identifier"
            label="Phone number, username, or email"
            value={identifier}
            onChange={(e) => {
              setIdentifier(e.target.value);
              if (errors.identifier) setErrors((prev) => ({ ...prev, identifier: '' }));
            }}
            error={errors.identifier}
            disabled={submitting}
            autoComplete="username"
            required
          />

          <FormField
            id="login-password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
            }}
            error={errors.password}
            disabled={submitting}
            autoComplete="current-password"
            required
          />

          <button
            type="submit"
            disabled={submitting || !identifier.trim() || !password}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold rounded-lg transition flex items-center justify-center gap-2 shadow-sm"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Log In</span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 pt-2">
          <div className="flex-1 h-px bg-neutral-800" />
          <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-neutral-800" />
        </div>

        <div className="text-center">
          <button
            type="button"
            className="text-xs text-neutral-400 hover:text-neutral-200 transition"
            onClick={() => alert('Password reset flow will be fully enabled in settings.')}
          >
            Forgot password?
          </button>
        </div>
      </div>

      {/* Switch to Signup Card */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 text-center text-xs text-neutral-400">
        <span>Don't have an account? </span>
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="font-semibold text-blue-500 hover:text-blue-400 transition"
        >
          Sign up
        </button>
      </div>
    </div>
  );
}
