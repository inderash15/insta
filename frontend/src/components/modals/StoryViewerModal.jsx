import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Eye, Send, Star, Volume2, VolumeX } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function StoryViewerModal({ storyGroup, isOpen, onClose }) {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [replySuccess, setReplySuccess] = useState(false);
  const [showViewersModal, setShowViewersModal] = useState(false);
  const [viewersList, setViewersList] = useState([]);
  const [isLoadingViewers, setIsLoadingViewers] = useState(false);
  const videoRef = useRef(null);

  if (!isOpen || !storyGroup || !storyGroup.stories?.length) return null;

  const currentStory = storyGroup.stories[currentIndex];
  const totalStories = storyGroup.stories.length;
  const author = storyGroup.author || storyGroup.user;
  const isAuthor = user && (user._id === author?._id || user.id === author?._id || storyGroup.isSelf);

  // View count increment
  useEffect(() => {
    if (currentStory?._id) {
      api.post(`/stories/${currentStory._id}/view`).catch(() => {});
    }
  }, [currentStory]);

  // Story progress timer
  useEffect(() => {
    setProgress(0);
    if (isPaused || showViewersModal) return;

    const intervalTime = 50; // ms
    const duration = 5000; // 5s duration
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          if (currentIndex < totalStories - 1) {
            setCurrentIndex((c) => c + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [currentIndex, totalStories, isPaused, showViewersModal]);

  const handleNext = () => {
    if (currentIndex < totalStories - 1) {
      setCurrentIndex((c) => c + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((c) => c - 1);
    }
  };

  const handleReact = async (emoji) => {
    if (!currentStory?._id) return;
    try {
      await api.post(`/stories/${currentStory._id}/react`, { emoji });
    } catch {}
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !currentStory?._id || isSendingReply) return;
    try {
      setIsSendingReply(true);
      await api.post(`/stories/${currentStory._id}/reply`, { text: replyText.trim() });
      setReplyText('');
      setReplySuccess(true);
      setTimeout(() => setReplySuccess(false), 2500);
    } catch (err) {
      // non-fatal
    } finally {
      setIsSendingReply(false);
    }
  };

  const fetchViewers = async () => {
    if (!currentStory?._id || !isAuthor) return;
    setIsLoadingViewers(true);
    setShowViewersModal(true);
    try {
      const res = await api.get(`/stories/${currentStory._id}/viewers`);
      if (res.data?.success) {
        setViewersList(res.data.viewers || []);
      }
    } catch {
      setViewersList([]);
    } finally {
      setIsLoadingViewers(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md select-none">
      {/* Close button */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-neutral-900/80 text-white hover:bg-neutral-800 transition"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Main container */}
      <div 
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        className="relative w-full max-w-sm h-[85vh] max-h-[750px] bg-neutral-950 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between border border-neutral-800"
      >
        {/* Story Progress Bars */}
        <div className="absolute top-3 inset-x-3 z-30 flex gap-1.5 pointer-events-none">
          {storyGroup.stories.map((s, idx) => (
            <div key={s._id} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-75"
                style={{
                  width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%'
                }}
              />
            </div>
          ))}
        </div>

        {/* User Header */}
        <div className="absolute top-6 inset-x-3 z-30 flex items-center justify-between text-white drop-shadow">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-full p-0.5 ${
              currentStory?.audience === 'close_friends' 
                ? 'bg-gradient-to-tr from-emerald-500 to-green-400' 
                : 'insta-story-gradient'
            }`}>
              <div className="w-full h-full bg-neutral-900 rounded-full flex items-center justify-center font-bold text-xs uppercase overflow-hidden">
                {author?.avatarUrl ? (
                  <img src={author.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  author?.username?.charAt(0) || 'U'
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold leading-tight">{author?.username}</span>
                {author?.isVerified && <span className="text-blue-400 text-[10px]">✓</span>}
                {currentStory?.audience === 'close_friends' && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full text-[9px] font-medium">
                    <Star className="w-2.5 h-2.5 fill-current" /> Close Friends
                  </span>
                )}
              </div>
              <p className="text-[10px] text-white/70">
                {currentStory?.createdAt ? new Date(currentStory.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentStory?.mediaType === 'video' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMuted(!isMuted);
                }}
                className="p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            )}

            {isAuthor && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fetchViewers();
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur text-xs text-white hover:bg-black/60 transition"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{currentStory?.viewers?.length || 0}</span>
              </button>
            )}
          </div>
        </div>

        {/* Story Media */}
        <div className="w-full h-full flex items-center justify-center bg-black relative">
          {currentStory?.mediaType === 'video' || currentStory?.mediaUrl?.endsWith('.mp4') ? (
            <video 
              ref={videoRef}
              src={currentStory.mediaUrl} 
              autoPlay 
              muted={isMuted}
              playsInline 
              className="w-full h-full object-cover" 
            />
          ) : (
            <img 
              src={currentStory?.mediaUrl} 
              alt="Story" 
              className="w-full h-full object-cover" 
            />
          )}

          {/* Navigation Click Zones */}
          <div 
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            className="absolute left-0 inset-y-0 w-1/3 cursor-pointer z-20 flex items-center pl-2 opacity-0 hover:opacity-100 transition"
          >
            {currentIndex > 0 && (
              <span className="p-1.5 rounded-full bg-black/40 text-white">
                <ChevronLeft className="w-5 h-5" />
              </span>
            )}
          </div>
          <div 
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            className="absolute right-0 inset-y-0 w-1/3 cursor-pointer z-20 flex items-center justify-end pr-2 opacity-0 hover:opacity-100 transition"
          >
            <span className="p-1.5 rounded-full bg-black/40 text-white">
              <ChevronRight className="w-5 h-5" />
            </span>
          </div>
        </div>

        {/* Footer Actions & Reply Bar */}
        <div className="absolute bottom-3 inset-x-3 z-30 flex flex-col gap-2">
          {currentStory?.caption && (
            <div className="bg-black/50 backdrop-blur-md rounded-xl p-2 border border-white/10 text-xs text-white/90">
              {currentStory.caption}
            </div>
          )}

          <div className="flex items-center gap-2">
            {!isAuthor ? (
              <form onSubmit={handleSendReply} className="flex-1 flex items-center relative">
                <input
                  type="text"
                  placeholder={replySuccess ? 'Reply sent to DM!' : `Send message to ${author?.username || 'user'}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onFocus={() => setIsPaused(true)}
                  onBlur={() => setIsPaused(false)}
                  className="w-full bg-black/60 backdrop-blur-md rounded-full px-4 py-2 border border-white/20 text-xs text-white placeholder-white/50 focus:outline-none focus:border-white/50 pr-9"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim() || isSendingReply}
                  className="absolute right-2 p-1 text-white hover:text-pink-400 disabled:opacity-40 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : null}

            {/* Quick Reactions */}
            <div className="flex items-center gap-1">
              {['❤️', '🔥', '😂', '👏'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReact(emoji);
                  }}
                  className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-sm hover:scale-125 active:scale-95 transition"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Author Viewer List Modal */}
      {showViewersModal && (
        <div className="fixed inset-0 z-60 flex items-end sm:items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-2xl max-h-[60vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-semibold text-sm text-white flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-neutral-400" />
                Viewers ({viewersList.length})
              </h3>
              <button
                onClick={() => setShowViewersModal(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-neutral-800/60 py-2">
              {isLoadingViewers ? (
                <p className="text-xs text-neutral-400 text-center py-4">Loading viewers...</p>
              ) : viewersList.length === 0 ? (
                <p className="text-xs text-neutral-500 text-center py-4">No views yet.</p>
              ) : (
                viewersList.map((v, i) => (
                  <div key={i} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center overflow-hidden">
                        {v.user?.avatarUrl ? (
                          <img src={v.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-white uppercase">{v.user?.username?.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">{v.user?.username}</p>
                        <p className="text-[10px] text-neutral-400">{v.user?.fullName}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-neutral-500">
                      {new Date(v.viewedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
