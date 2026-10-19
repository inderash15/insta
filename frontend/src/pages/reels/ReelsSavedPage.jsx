import React, { useState, useEffect } from 'react';
import { Bookmark, Film, Play, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import ReelsNav from '../../components/reels/ReelsNav';

export default function ReelsSavedPage() {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedReels = async () => {
      setLoading(true);
      try {
        // Fetch feed/saved or reels
        const res = await api.get('/reels');
        if (res.data?.success) {
          // If reels have like or save filter
          setReels(res.data.reels || []);
        }
      } catch (err) {
        console.error('Failed to load saved reels:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedReels();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 space-y-6">
      <ReelsNav />

      <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
        <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
          <Bookmark className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-base font-bold text-neutral-100">Saved Reels</h1>
          <p className="text-xs text-neutral-400">Only you can see the reels you have saved</p>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
          <p className="text-xs text-neutral-500">Loading saved reels...</p>
        </div>
      ) : reels.length === 0 ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-neutral-800 text-neutral-400 mx-auto flex items-center justify-center">
            <Bookmark className="w-7 h-7" />
          </div>
          <p className="text-sm font-semibold text-neutral-200">No saved reels</p>
          <p className="text-xs text-neutral-500">Save clips to watch them again later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {reels.map((reel) => (
            <Link
              key={reel._id}
              to={`/reels/${reel._id}`}
              className="group relative aspect-[9/16] bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 hover:border-pink-500/50 transition-all"
            >
              <video
                src={reel.videoUrl}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                muted
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 text-white">
                <div className="flex items-center gap-1.5 text-xs font-semibold mb-1">
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>{reel.viewsCount || 0}</span>
                </div>
                {reel.caption && (
                  <p className="text-[11px] line-clamp-1 text-neutral-300">{reel.caption}</p>
                )}
                <span className="text-[10px] text-neutral-400">@{reel.author?.username}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
