import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, LogIn, ShieldAlert } from 'lucide-react';

export default function SessionExpiredPage() {
  return (
    <div className="w-full max-w-sm space-y-4 text-center">
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-8 space-y-6 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto shadow-inner">
          <Clock className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-xl font-bold tracking-tight text-white">Session Expired</h1>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Your login session has expired due to inactivity or token rotation. Please log back in to resume where you left off.
          </p>
        </div>

        <Link
          to="/auth/login"
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
        >
          <LogIn className="w-4 h-4" />
          <span>Log In Again</span>
        </Link>
      </div>
    </div>
  );
}
