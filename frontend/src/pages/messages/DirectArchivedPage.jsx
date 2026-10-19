import React, { useState, useEffect } from 'react';
import { Archive, MessageSquare, ArrowLeft, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import DirectNav from '../../components/messages/DirectNav';

export default function DirectArchivedPage() {
  const navigate = useNavigate();
  const [archived, setArchived] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <div className="w-full max-w-xl mx-auto py-6 px-4 space-y-6">
      <DirectNav />

      <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
        <div className="p-2.5 rounded-xl bg-neutral-800 text-neutral-300">
          <Archive className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-base font-bold text-neutral-100">Archived Chats</h1>
          <p className="text-xs text-neutral-400">Conversations stored away from your main inbox</p>
        </div>
      </div>

      <div className="py-20 text-center space-y-2 text-neutral-500 text-xs">
        <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 mx-auto flex items-center justify-center text-neutral-400">
          <Archive className="w-6 h-6" />
        </div>
        <p className="font-semibold text-neutral-300">No archived chats</p>
        <p>Conversations you archive will remain here until you restore them.</p>
      </div>
    </div>
  );
}
