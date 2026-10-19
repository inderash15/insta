import React, { useState, useEffect } from 'react';
import { X, Sparkles, ThumbsDown, EyeOff, Sliders, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

export default function PulseRankExplainModal({ reel, isOpen, onClose, onFeedbackApplied }) {
  const [loading, setLoading] = useState(true);
  const [explainData, setExplainData] = useState(null);
  const [actionNotice, setActionNotice] = useState('');

  useEffect(() => {
    if (!isOpen || !reel?._id) return;

    let isMounted = true;
    setLoading(true);
    api.get(`/reels/${reel._id}/explain`)
      .then((res) => {
        if (isMounted && res.data?.success) {
          setExplainData(res.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [isOpen, reel]);

  if (!isOpen || !reel) return null;

  const handleFeedback = async (action, reason) => {
    try {
      await api.post(`/reels/${reel._id}/feedback`, { action, reason });
      setActionNotice(
        action === 'not_interested' 
          ? 'Marked as Not Interested. Tuning your feed...' 
          : 'Creator hidden from recommendations.'
      );
      setTimeout(() => {
        if (onFeedbackApplied) onFeedbackApplied(reel._id, action);
        onClose();
      }, 1000);
    } catch {
      // non-fatal
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Why am I seeing this?</h3>
            <p className="text-[10px] text-purple-400 font-medium">Powered by PulseRank Engine</p>
          </div>
        </div>

        {actionNotice ? (
          <div className="my-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-2xl flex items-center gap-3 text-xs text-purple-300">
            <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        ) : loading ? (
          <div className="py-8 text-center text-xs text-neutral-400">
            Analyzing recommendation signals...
          </div>
        ) : (
          <div className="space-y-4 my-3">
            {/* Transparent Reasons */}
            <div className="bg-neutral-950 border border-neutral-800/80 rounded-2xl p-3.5 space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500">
                Key Ranking Factors
              </span>
              <ul className="space-y-1.5">
                {(explainData?.reasons || ['Curated based on community trends']).map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-neutral-200">
                    <span className="text-pink-500 text-sm leading-none mt-0.5">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() => handleFeedback('not_interested', 'User marked not interested')}
                className="w-full py-2.5 px-3.5 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/60 text-xs font-semibold text-neutral-200 flex items-center gap-2.5 transition text-left"
              >
                <ThumbsDown className="w-4 h-4 text-amber-400" />
                <div>
                  <p className="leading-tight">Not interested</p>
                  <p className="text-[10px] text-neutral-400 font-normal">Show fewer videos like this</p>
                </div>
              </button>

              <button
                onClick={() => handleFeedback('hide_creator', 'User hid creator')}
                className="w-full py-2.5 px-3.5 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/60 text-xs font-semibold text-neutral-200 flex items-center gap-2.5 transition text-left"
              >
                <EyeOff className="w-4 h-4 text-red-400" />
                <div>
                  <p className="leading-tight">Don't recommend this creator</p>
                  <p className="text-[10px] text-neutral-400 font-normal">Hide posts from @{reel.author?.username}</p>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
