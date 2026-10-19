import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Music, 
  Volume2, 
  VolumeX, 
  Play, 
  Loader2, 
  Film,
  Sparkles 
} from 'lucide-react';
import api from '../../services/api';
import ReelsNav from '../../components/reels/ReelsNav';
import PulseRankExplainModal from '../../components/reels/PulseRankExplainModal';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

export default function ReelsPage() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [showCommentsForReel, setShowCommentsForReel] = useState(null);
  const [explainReel, setExplainReel] = useState(null);
  const [reelComments, setReelComments] = useState([]);
  const [newReelComment, setNewReelComment] = useState('');
  const [submittingReelComment, setSubmittingReelComment] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(null);

  const fetchReels = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reels');
      if (res.data?.success) {
        setReels(res.data.reels || []);
      }
    } catch (err) {
      console.error('Failed to load reels:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReels();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const currentUserId = (user?._id || user?.id)?.toString();

    const handleReelLiked = ({ reelId, likesCount, userId }) => {
      setReels((prev) =>
        prev.map((r) =>
          r._id === reelId
            ? {
                ...r,
                likesCount,
                ...(userId?.toString() === currentUserId ? { isLiked: true } : {})
              }
            : r
        )
      );
    };

    const handleReelUnliked = ({ reelId, likesCount, userId }) => {
      setReels((prev) =>
        prev.map((r) =>
          r._id === reelId
            ? {
                ...r,
                likesCount,
                ...(userId?.toString() === currentUserId ? { isLiked: false } : {})
              }
            : r
        )
      );
    };

    const handleReelCreated = ({ reel }) => {
      if (reel) {
        setReels((prev) => [reel, ...prev.filter((r) => r._id !== reel._id)]);
      }
    };

    const handleReelDeleted = ({ reelId }) => {
      if (reelId) {
        setReels((prev) => prev.filter((r) => r._id !== reelId));
      }
    };

    const handleReelViewed = ({ reelId, viewsCount }) => {
      if (viewsCount !== undefined) {
        setReels((prev) =>
          prev.map((r) => (r._id === reelId ? { ...r, viewsCount } : r))
        );
      }
    };

    socket.on('reel:liked', handleReelLiked);
    socket.on('reel:unliked', handleReelUnliked);
    socket.on('reel:created', handleReelCreated);
    socket.on('reel:deleted', handleReelDeleted);
    socket.on('reel:viewed', handleReelViewed);

    return () => {
      socket.off('reel:liked', handleReelLiked);
      socket.off('reel:unliked', handleReelUnliked);
      socket.off('reel:created', handleReelCreated);
      socket.off('reel:deleted', handleReelDeleted);
      socket.off('reel:viewed', handleReelViewed);
    };
  }, [socket, user]);

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
          <p className="text-xs text-neutral-500">Loading reels...</p>
        </div>
      ) : reels.length === 0 ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-pink-500/10 text-pink-400 mx-auto flex items-center justify-center">
            <Film className="w-7 h-7" />
          </div>
          <p className="text-sm font-semibold text-neutral-200">No reels published yet</p>
          <p className="text-xs text-neutral-500">Be the first creator to share an immersive reel!</p>
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
                autoPlay
                loop
                muted={isMuted}
                playsInline
                className="w-full h-full object-cover"
                onPlay={() => {
                  api.post(`/reels/${reel._id}/view`).catch(() => {});
                }}
              />

              {/* Mute / Unmute Button */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white backdrop-blur hover:bg-black/80 transition z-30"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Right Floating Actions Column */}
              <div className="absolute right-3 bottom-16 flex flex-col items-center gap-5 z-30 text-white">
                {/* Like Button */}
                <button
                  onClick={() => handleToggleLike(reel._id, idx)}
                  className="flex flex-col items-center gap-1 group active:scale-90 transition"
                >
                  <div className={`p-2.5 rounded-full bg-black/40 backdrop-blur border border-white/10 group-hover:bg-black/60 transition ${reel.isLiked ? 'text-red-500' : 'text-white'}`}>
                    <Heart className={`w-6 h-6 ${reel.isLiked ? 'fill-red-500' : ''}`} />
                  </div>
                  <span className="text-[11px] font-bold drop-shadow">
                    {reel.likesCount || 0}
                  </span>
                </button>

                {/* Comments */}
                <button 
                  onClick={() => setShowCommentsForReel(showCommentsForReel === reel._id ? null : reel._id)}
                  className="flex flex-col items-center gap-1 group active:scale-90 transition"
                  title="View comments"
                >
                  <div className={`p-2.5 rounded-full backdrop-blur border transition text-white ${showCommentsForReel === reel._id ? 'bg-pink-600 border-pink-500' : 'bg-black/40 border-white/10 group-hover:bg-black/60'}`}>
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold drop-shadow">Comments</span>
                </button>

                {/* Share / Copy */}
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.origin + `/reel/${reel._id}`);
                    setCopyFeedback(reel._id);
                    setTimeout(() => setCopyFeedback(null), 2500);
                  }}
                  className="flex flex-col items-center gap-1 group active:scale-90 transition relative"
                  title="Share reel"
                >
                  <div className="p-2.5 rounded-full bg-black/40 backdrop-blur border border-white/10 group-hover:bg-black/60 transition text-white">
                    <Share2 className="w-5 h-5" />
                  </div>
                  {copyFeedback === reel._id && (
                    <span className="absolute -left-12 -top-8 px-2 py-1 bg-black/90 text-[10px] text-pink-400 font-bold rounded-lg whitespace-nowrap shadow border border-pink-500/30">
                      Link copied!
                    </span>
                  )}
                </button>

                {/* PulseRank Explain Button */}
                <button
                  onClick={() => setExplainReel(reel)}
                  className="flex flex-col items-center gap-1 group active:scale-90 transition"
                  title="Why am I seeing this?"
                >
                  <div className="p-2.5 rounded-full bg-black/40 backdrop-blur border border-purple-500/30 group-hover:bg-purple-900/40 transition text-purple-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold text-purple-300 drop-shadow">PulseRank</span>
                </button>

                {/* Spinning Audio Disk */}
                <div className="w-9 h-9 rounded-full bg-neutral-900 border-2 border-white/30 p-1 flex items-center justify-center animate-spin" style={{ animationDuration: '4s' }}>
                  <Music className="w-4 h-4 text-pink-400" />
                </div>
              </div>

              {/* Comments Slide-up Sheet */}
              {showCommentsForReel === reel._id && (
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-neutral-900/95 backdrop-blur-md rounded-t-2xl z-40 p-4 flex flex-col border-t border-neutral-800 animate-slideUp">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                    <h4 className="text-xs font-bold text-neutral-200">Comments</h4>
                    <button 
                      onClick={() => setShowCommentsForReel(null)}
                      className="text-neutral-400 hover:text-white text-xs px-2 py-0.5"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto py-2 text-xs text-neutral-400 text-center flex flex-col items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-neutral-600 mb-1" />
                    <p>No comments yet. Start the conversation!</p>
                  </div>
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newReelComment.trim()) return;
                      alert('Comment submitted!');
                      setNewReelComment('');
                    }}
                    className="flex items-center gap-2 pt-2 border-t border-neutral-800"
                  >
                    <input 
                      type="text" 
                      value={newReelComment}
                      onChange={(e) => setNewReelComment(e.target.value)}
                      placeholder="Add a comment for this reel..." 
                      className="flex-1 bg-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none"
                    />
                    <button 
                      type="submit" 
                      disabled={!newReelComment.trim()}
                      className="text-xs font-bold text-pink-500 disabled:opacity-40"
                    >
                      Post
                    </button>
                  </form>
                </div>
              )}

              {/* Bottom Reel Details Overlay */}
              <div className="absolute bottom-4 inset-x-4 z-30 text-white drop-shadow space-y-2 pointer-events-none">
                {/* Creator Header */}
                <div className="flex items-center gap-2.5 pointer-events-auto">
                  <div className="w-8 h-8 rounded-full insta-story-gradient p-0.5">
                    <div className="w-full h-full bg-neutral-950 rounded-full flex items-center justify-center font-bold text-xs uppercase overflow-hidden">
                      {reel.author?.avatarUrl ? (
                        <img src={reel.author.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        reel.author?.username?.charAt(0) || 'U'
                      )}
                    </div>
                  </div>
                  <p className="text-xs font-bold flex items-center gap-1">
                    <span>{reel.author?.username}</span>
                    {reel.author?.isVerified && <span className="text-blue-400 text-[10px]">✓</span>}
                  </p>
                </div>

                {/* Caption */}
                {reel.caption && (
                  <p className="text-xs text-white/90 line-clamp-2 leading-relaxed">
                    {reel.caption}
                  </p>
                )}

                {/* Audio Title */}
                <div className="flex items-center gap-1.5 text-[11px] text-white/80">
                  <Music className="w-3 h-3 text-pink-400 shrink-0" />
                  <span className="truncate max-w-[200px]">{reel.audioTitle || 'Original Audio'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PulseRank Explain & Feedback Modal */}
      <PulseRankExplainModal
        reel={explainReel}
        isOpen={!!explainReel}
        onClose={() => setExplainReel(null)}
        onFeedbackApplied={(reelId) => {
          setReels((prev) => prev.filter((r) => r._id !== reelId));
        }}
      />
    </div>
  );
}
