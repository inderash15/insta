import React, { useState } from 'react';
import { ShieldAlert, ArrowLeft, UserX, Check, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SafetyRestrictedPage() {
  const navigate = useNavigate();
  const [restrictedUsers] = useState([]);

  return (
    <div className="w-full max-w-xl mx-auto py-6 px-4 space-y-6">
      <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
        <button
          onClick={() => navigate('/safety')}
          className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-base font-bold text-neutral-100">Restricted Accounts</h1>
          <p className="text-xs text-neutral-400">Protect yourself from unwanted interactions without blocking</p>
        </div>
      </div>

      <div className="p-4 bg-neutral-900/40 border border-neutral-800 rounded-2xl flex items-start gap-3 text-xs text-neutral-400">
        <Info className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
        <span>
          When you restrict someone, only you and that person will be able to see their new comments on your posts. You won&apos;t receive notifications from them, and their chats will be moved to Message Requests.
        </span>
      </div>

      <div className="py-20 text-center space-y-2 text-neutral-500 text-xs">
        <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 mx-auto flex items-center justify-center text-neutral-400">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <p className="font-semibold text-neutral-300">No restricted accounts</p>
        <p>You can restrict any account from their profile options menu.</p>
      </div>
    </div>
  );
}
