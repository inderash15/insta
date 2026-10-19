import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Heart, 
  MessageCircle, 
  BarChart2, 
  Share2, 
  Music, 
  ArrowLeft, 
  Volume2, 
  VolumeX, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ReelDetailPage() {
  const { reelId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [reel, setReel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const fetchReel = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/reels/${reelId}`);
        if (res.data?.success) {
          setReel(res.data.reel);
          // Register view count
          api.post(`/reels/${reelId}/view`).catch(() => {});
        } else {
          setError('Reel not found.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load reel.');
      } finally {
        setLoading(false);
      }
    };

    if (reelId) {
      fetchReel();
    }
  }, [reelId]);

  const handleToggleLike = async () => {
    if (!reel) return;
    const prevLiked = reel.isLiked;
    const prevCount = reel.likesCount;

    setReel((prev) => ({
      ...prev,
      isLiked: !prevLiked,
      likesCount: prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1
    }));

    try {
      const res = await api.post(`/reels/${reelId}/like`);
      setReel((prev) => ({
        ...prev,
        isLiked: res.data.liked,
        likesCount: res.data.likesCount
      }));
    } catch {
      setReel((prev) => ({
        ...prev,
        isLiked: prevLiked,
        likesCount: prevCount
      }));
    }
  };

  if (loading) {
    return (
      <div className="w-full py-24 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
        <p className="text-xs text-neutral-500">Loading reel...</p>
      </div>
    );
  }

  if (error || !reel) {
    return (
      <div className="w-full max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 mx-auto flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-neutral-200">{error || 'Reel not found'}</p>
        <button
          onClick={() => navigate('/reels')}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
        >
          Back to Reels
        </button>
      </div>
    );
  }

  const isAuthor = user && (user._id === reel.author?._id || user._id === reel.author);

  return (
    <div className="w-full flex flex-col items-center py-4 px-2">
      <div className="w-full max-w-sm mb-3 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {isAuthor && (
          <Link
            to={`/reels/${reel._id}/insights`}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-medium hover:bg-purple-500/20 border border-purple-500/20"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Insights</span>
          </Link>
        )}
      </div>

      <div className="relative w-full max-w-sm h-[82vh] max-h-[760px] rounded-2xl border border-neutral-800 shadow-2xl bg-black overflow-hidden flex items-center justify-center">
        <video
          src={reel.videoUrl}
          className="w-full h-full object-cover"
          loop
          autoPlay
          muted={isMuted}
          playsInline
          onClick={() => setIsMuted(!isMuted)}
        />

        <button
          onClick={() => setIsMuted(!isMuted)}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <div className="absolute right-3 bottom-14 flex flex-col items-center gap-5 z-20">
          <button
            onClick={handleToggleLike}
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

          {isAuthor && (
            <Link
              to={`/reels/${reel._id}/insights`}
              className="flex flex-col items-center gap-1 group text-white"
            >
              <div className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur">
                <BarChart2 className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-semibold drop-shadow">Stats</span>
            </Link>
          )}
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
            <Music className="w-3.5 h-3.5 animate-pulse text-pink-400" />
            <span className="truncate">{reel.audioTitle || 'Original Audio'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
