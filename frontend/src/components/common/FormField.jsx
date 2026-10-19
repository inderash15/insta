import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function FormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required = false,
  disabled = false,
  autoComplete
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full space-y-1">
      <div className="relative">
        <input
          id={id}
          name={id}
          type={effectiveType}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          placeholder={placeholder || label}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-neutral-900/80 border rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none transition ${
            error
              ? 'border-red-500 focus:border-red-400 focus:ring-1 focus:ring-red-400'
              : 'border-neutral-800 focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${isPassword ? 'pr-10' : ''}`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            disabled={disabled}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 transition"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>

      {error && (
        <p id={`${id}-error`} className="text-[11px] text-red-400 font-medium pl-1">
          {error}
        </p>
      )}
    </div>
  );
}
