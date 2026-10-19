import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Check, X } from 'lucide-react';

export default function DirectGroupRequestsPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [requests] = useState([]);

  return (
    <div className="w-full max-w-xl mx-auto py-6 px-4 space-y-6">
      <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
        <button
          onClick={() => navigate(`/direct/${conversationId}/details`)}
          className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-base font-bold text-neutral-100">Group Join Requests</h1>
          <p className="text-xs text-neutral-400">Review pending member admissions</p>
        </div>
      </div>

      <div className="py-20 text-center space-y-2 text-neutral-500 text-xs">
        <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 mx-auto flex items-center justify-center text-neutral-400">
          <UserPlus className="w-6 h-6" />
        </div>
        <p className="font-semibold text-neutral-300">No pending join requests</p>
        <p>When someone requests to join this group chat, their approval request will appear here.</p>
      </div>
    </div>
  );
}
