import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import { Share2, Copy, Check, MessageSquare, Send, Globe } from 'lucide-react';

export default function PostSharesPage() {
  const { postId } = useParams();
  const [copied, setCopied] = useState(false);

  const postUrl = `${window.location.origin}/posts/${postId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(postUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-md mx-auto py-6 px-4 space-y-6 text-neutral-100">
      <PageHeader
        title="Share Post"
        subtitle="Forward this content to friends, groups, or copy the direct permalink."
        showBack
      />

      <div className="rounded-3xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-5 shadow-xl">
        {/* Link Input Row */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-400">Direct Post URL</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={postUrl}
              className="flex-1 py-2.5 px-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-300 focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white transition flex items-center justify-center"
              title="Copy link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Share Destinations */}
        <div className="space-y-2 pt-2 border-t border-neutral-800">
          <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Share options</h4>

          <button
            onClick={handleCopy}
            className="w-full p-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 flex items-center justify-between text-xs text-white transition"
          >
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-blue-400" />
              <span>Copy Public Link</span>
            </div>
            {copied ? <span className="text-emerald-400 text-[11px]">Copied!</span> : <span className="text-neutral-500">Copy</span>}
          </button>

          <button
            onClick={() => alert('Direct message forwarding available in inbox.')}
            className="w-full p-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 flex items-center justify-between text-xs text-white transition"
          >
            <div className="flex items-center gap-3">
              <Send className="w-4 h-4 text-pink-400" />
              <span>Send in Direct Message</span>
            </div>
            <span className="text-neutral-500">Forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
