import React, { useState } from 'react';
import { Instagram, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import FormField from '../../components/common/FormField';

export default function SignupPage({ onSwitchToLogin }) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const userRegex = /^[a-zA-Z0-9._]+$/;

    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      errs.email = 'Please provide a valid email address';
    }

    if (!formData.fullName.trim()) {
      errs.fullName = 'Full name is required';
    }

    if (!formData.username.trim()) {
      errs.username = 'Username is required';
    } else if (formData.username.trim().length < 3) {
      errs.username = 'Username must be at least 3 characters';
    } else if (formData.username.trim().length > 30) {
      errs.username = 'Username cannot exceed 30 characters';
    } else if (!userRegex.test(formData.username.trim())) {
      errs.username = 'Only letters, numbers, periods, and underscores allowed';
    }

    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errs.password = 'Password must be at least 8 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
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
      await register({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        fullName: formData.fullName.trim()
      });
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please review your details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-sm space-y-4">
      {/* Primary Signup Card */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-8 space-y-6 shadow-xl">
        {/* Brand Header */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="w-12 h-12 rounded-2xl insta-story-gradient p-0.5 flex items-center justify-center shadow-lg shadow-pink-500/20">
            <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center">
              <Instagram className="w-6 h-6 text-pink-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-100">Insta</h1>
          <p className="text-xs text-neutral-400 leading-relaxed font-medium">
            Sign up to see photos and videos from your friends.
          </p>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="bg-red-950/40 border border-red-900/60 rounded-lg p-3 flex items-start gap-2.5 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <FormField
            id="signup-email"
            label="Email address"
            type="email"
            value={formData.email}
            onChange={handleChange('email')}
            error={errors.email}
            disabled={submitting}
            autoComplete="email"
            required
          />

          <FormField
            id="signup-fullname"
            label="Full Name"
            value={formData.fullName}
            onChange={handleChange('fullName')}
            error={errors.fullName}
            disabled={submitting}
            autoComplete="name"
            required
          />

          <FormField
            id="signup-username"
            label="Username"
            value={formData.username}
            onChange={handleChange('username')}
            error={errors.username}
            disabled={submitting}
            autoComplete="username"
            required
          />

          <FormField
            id="signup-password"
            label="Password (min 8 characters)"
            type="password"
            value={formData.password}
            onChange={handleChange('password')}
            error={errors.password}
            disabled={submitting}
            autoComplete="new-password"
            required
          />

          <FormField
            id="signup-confirm-password"
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange('confirmPassword')}
            error={errors.confirmPassword}
            disabled={submitting}
            autoComplete="new-password"
            required
          />

          <p className="text-[11px] text-neutral-500 text-center leading-normal pt-1">
            By signing up, you agree to our Terms, Privacy Policy and Cookies Policy.
          </p>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold rounded-lg transition flex items-center justify-center gap-2 shadow-sm"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <span>Sign Up</span>
            )}
          </button>
        </form>
      </div>

      {/* Switch to Login Card */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 text-center text-xs text-neutral-400">
        <span>Have an account? </span>
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-semibold text-blue-500 hover:text-blue-400 transition"
        >
          Log in
        </button>
      </div>
    </div>
  );
}
