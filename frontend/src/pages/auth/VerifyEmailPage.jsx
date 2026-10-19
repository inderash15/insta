import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle2, RotateCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function VerifyEmailPage() {
  const { user } = useAuth();
  const [resending, setResending] = useState(false);
  const [sentMessage, setSentMessage] = useState(false);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [verified, setVerified] = useState(false);

  const handleDigitChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    const nextCode = [...code];
    nextCode[index] = value;
    setCode(nextCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`digit-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    if (code.join('').length === 6) {
      setVerified(true);
    }
  };

  const handleResend = () => {
    setResending(true);
    setTimeout(() => {
      setResending(false);
      setSentMessage(true);
    }, 800);
  };

  return (
    <div className="w-full max-w-sm space-y-4">
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-8 space-y-6 shadow-xl text-center">
        <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-pink-500 mx-auto shadow-inner">
          <Mail className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-xl font-bold tracking-tight text-white">Verify Your Email</h1>
          <p className="text-xs text-neutral-400 leading-relaxed">
            We sent a 6-digit confirmation code to{' '}
            <span className="text-white font-medium">{user?.email || 'your registered address'}</span>.
          </p>
        </div>

        {verified ? (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-900/60 text-emerald-300 text-xs flex flex-col items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            <p className="font-semibold text-white">Email Address Verified!</p>
            <Link
              to="/home"
              className="mt-2 w-full py-2.5 rounded-xl insta-story-gradient text-white font-semibold transition"
            >
              Continue to Insta
            </Link>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-5">
            <div className="flex justify-center gap-2">
              {code.map((digit, i) => (
                <input
                  key={i}
                  id={`digit-${i}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  className="w-10 h-12 text-center text-lg font-bold rounded-xl bg-neutral-900 border border-neutral-800 focus:border-pink-500 focus:outline-none text-white"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={code.join('').length < 6}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition shadow-sm"
            >
              Confirm Code
            </button>
          </form>
        )}

        <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <span>Didn't receive it?</span>
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-blue-500 hover:text-blue-400 font-medium transition inline-flex items-center gap-1"
          >
            <RotateCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
            <span>Resend</span>
          </button>
        </div>

        {sentMessage && (
          <p className="text-[11px] text-emerald-400 font-medium">New code dispatched to your inbox.</p>
        )}
      </div>
    </div>
  );
}
