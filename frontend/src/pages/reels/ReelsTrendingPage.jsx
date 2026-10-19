import React, { useState, useEffect } from 'react';
import { Loader2, Flame, Heart, MessageCircle, Volume2, VolumeX, Music } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import ReelsNav from '../../components/reels/ReelsNav';

export default function ReelsTrendingPage() {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const fetchTrendingReels = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reels?filter=trending');
      if (res.data?.success) {
        setReels(res.data.reels || []);
      }
    } catch (err) {
      console.error('Failed to load trending reels:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingReels();
  }, []);

  const handleToggleLike = async (reelId, index) => {
    const current = reels[index];
    const prevLiked = current.isLiked;
    const prevCount = current.likesCount;

    setReels((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        isLiked: !prevLiked,
        likesCount: prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1
      };
      return next;
    });

    try {
      const res = await api.post(`/reels/${reelId}/like`);
      setReels((prev) => {
        const next = [...prev];
        next[index] = {
          ...next[index],
          isLiked: res.data.liked,
          likesCount: res.data.likesCount
        };
        return next;
      });
    } catch {
      setReels((prev) => {
        const next = [...prev];
        next[index] = {
          ...next[index],
          isLiked: prevLiked,
          likesCount: prevCount
        };
        return next;
      });
    }
  };

  return (
    <div className="w-full flex flex-col items-center py-4 px-2">
      <ReelsNav />
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
          <p className="text-xs text-neutral-500">Discovering trending reels...</p>
        </div>
      ) : reels.length === 0 ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-orange-500/10 text-orange-400 mx-auto flex items-center justify-center">
            <Flame className="w-7 h-7" />
          </div>
          <p className="text-sm font-semibold text-neutral-200">No trending reels yet</p>
          <p className="text-xs text-neutral-500">The most viewed and liked reels will appear here automatically.</p>
        </div>
      ) : (
        <div className="w-full max-w-sm h-[82vh] max-h-[760px] overflow-y-scroll snap-y snap-mandatory no-scrollbar rounded-2xl border border-neutral-800 shadow-2xl bg-black">
          {reels.map((reel, idx) => (
            <div
              key={reel._id}
              className="relative w-full h-full snap-start flex items-center justify-center bg-black overflow-hidden select-none"
            >
              <video
                src={reel.videoUrl}
                className="w-full h-full object-cover"
                loop
                autoPlay
                muted={isMuted}
                playsInline
                onClick={() => setIsMuted(!isMuted)}
              />

              <div className="absolute top-4 left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/80 backdrop-blur text-white text-[10px] font-bold">
                <Flame className="w-3.5 h-3.5 fill-white" />
                <span>Trending #{idx + 1}</span>
              </div>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <div className="absolute right-3 bottom-14 flex flex-col items-center gap-5 z-20">
                <button
                  onClick={() => handleToggleLike(reel._id, idx)}
                  className="flex flex-col items-center gap-1 group text-white"
                >
                  <div
                    className={`p-2.5 rounded-full backdrop-blur transition-all ${
                      reel.isLiked ? 'bg-red-500/20 text-red-500' : 'bg-black/40 hover:bg-black/60'
                    }`}
                  >
                    <Heart className={`w-6 h-6 ${reel.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                  </div>
                  <span className="text-[11px] font-semibold drop-shadow">{reel.likesCount || 0}</span>
                </button>

                <Link
                  to={`/reels/${reel._id}/comments`}
                  className="flex flex-col items-center gap-1 group text-white"
                >
                  <div className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-semibold drop-shadow">{reel.commentsCount || 0}</span>
                </Link>
              </div>

              <div className="absolute bottom-4 left-4 right-14 text-white z-10 space-y-2">
                <Link to={`/users/${reel.author?.username}`} className="flex items-center gap-2 group">
                  <div className="w-9 h-9 rounded-full bg-neutral-800 border border-white/20 overflow-hidden">
                    {reel.author?.avatarUrl ? (
                      <img src={reel.author.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-xs">
                        {reel.author?.username?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="font-semibold text-xs tracking-wide group-hover:underline">
                    @{reel.author?.username}
                  </span>
                </Link>
                {reel.caption && (
                  <p className="text-xs line-clamp-2 text-neutral-200 drop-shadow">{reel.caption}</p>
                )}
                <div className="flex items-center gap-2 text-[11px] text-neutral-300 drop-shadow">
                  <Music className="w-3.5 h-3.5 animate-pulse text-orange-400" />
                  <span className="truncate">{reel.audioTitle || 'Original Audio'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
