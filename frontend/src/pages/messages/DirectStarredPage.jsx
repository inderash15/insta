import React, { useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import DirectNav from '../../components/messages/DirectNav';

export default function DirectStarredPage() {
  const [starred] = useState([]);

  return (
    <div className="w-full max-w-xl mx-auto py-6 px-4 space-y-6">
      <DirectNav />

      <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
          <Star className="w-6 h-6 fill-amber-400" />
        </div>
        <div>
          <h1 className="text-base font-bold text-neutral-100">Starred Messages</h1>
          <p className="text-xs text-neutral-400">Important messages you have marked for fast reference</p>
        </div>
      </div>

      <div className="py-20 text-center space-y-2 text-neutral-500 text-xs">
        <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 mx-auto flex items-center justify-center text-neutral-400">
          <Star className="w-6 h-6" />
        </div>
        <p className="font-semibold text-neutral-300">No starred messages</p>
        <p>Star messages inside any conversation to bookmark key notes and links.</p>
      </div>
    </div>
  );
}
