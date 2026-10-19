import React, { useState, useEffect } from 'react';
import { UserCheck, ShieldCheck, Check, X, Loader2, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import DirectNav from '../../components/messages/DirectNav';
import api from '../../services/api';

export default function DirectRequestsPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <div className="w-full max-w-xl mx-auto py-6 px-4 space-y-6">
      <DirectNav />

      <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
        <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
          <UserCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-base font-bold text-neutral-100">Message Requests</h1>
          <p className="text-xs text-neutral-400">Messages from people you do not follow</p>
        </div>
      </div>

      <div className="p-4 bg-neutral-900/40 border border-neutral-800 rounded-2xl flex items-center gap-3 text-xs text-neutral-400">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
        <span>Open a request to get more info about who is messaging you. They won&apos;t know you&apos;ve seen it until you accept.</span>
      </div>

      {loading ? (
        <div className="py-24 flex justify-center">
          <Loader2 className="w-6 h-6 text-pink-500 animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <div className="py-20 text-center space-y-2 text-neutral-500 text-xs">
          <p className="font-semibold text-neutral-300">No message requests</p>
          <p>You have reviewed all incoming requests.</p>
        </div>
      ) : (
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl divide-y divide-neutral-800/60">
          {requests.map((r) => (
            <div key={r._id} className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-800" />
                <div>
                  <p className="text-xs font-semibold text-neutral-200">@{r.sender?.username}</p>
                  <p className="text-[11px] text-neutral-400 truncate max-w-xs">{r.preview}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/30">
                  Accept
                </button>
                <button className="px-3 py-1 rounded-xl bg-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/30">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
