import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Eye, Heart, Flame } from 'lucide-react';
import api from '../../services/api';

export default function StoryViewerModal({ storyGroup, isOpen, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  if (!isOpen || !storyGroup || !storyGroup.stories?.length) return null;

  const currentStory = storyGroup.stories[currentIndex];
  const totalStories = storyGroup.stories.length;

  // View count increment
  useEffect(() => {
    if (currentStory?._id) {
      api.post(`/stories/${currentStory._id}/view`).catch(() => {});
    }
  }, [currentStory]);

  // Timer & progress bar (5s per story)
  useEffect(() => {
    setProgress(0);
    const intervalTime = 50; // ms
    const duration = 5000; // 5000ms
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
  }, [currentIndex, totalStories]);

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
      await api.post(`/stories/${currentStory._id}/react`, { reaction: emoji });
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md">
      {/* Close button */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-neutral-900/80 text-white hover:bg-neutral-800 transition"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Main container */}
      <div className="relative w-full max-w-sm h-[85vh] max-h-[750px] bg-neutral-950 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between border border-neutral-800">
        {/* Story Progress Bars */}
        <div className="absolute top-3 inset-x-3 z-30 flex gap-1.5">
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
            <div className="w-8 h-8 rounded-full insta-story-gradient p-0.5">
              <div className="w-full h-full bg-neutral-900 rounded-full flex items-center justify-center font-bold text-xs uppercase overflow-hidden">
                {storyGroup.user?.avatarUrl ? (
                  <img src={storyGroup.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  storyGroup.user?.username?.charAt(0) || 'U'
                )}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold leading-tight flex items-center gap-1">
                <span>{storyGroup.user?.username}</span>
                {storyGroup.user?.isVerified && <span className="text-blue-400 text-[10px]">✓</span>}
              </p>
              <p className="text-[10px] text-white/70">
                {currentStory?.createdAt ? new Date(currentStory.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
              </p>
            </div>
          </div>
        </div>

        {/* Story Media */}
        <div className="w-full h-full flex items-center justify-center bg-black relative">
          {currentStory?.mediaUrl?.endsWith('.mp4') || currentStory?.mediaUrl?.endsWith('.webm') ? (
            <video 
              src={currentStory.mediaUrl} 
              autoPlay 
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
            onClick={handlePrev}
            className="absolute left-0 inset-y-0 w-1/3 cursor-pointer z-20 flex items-center pl-2 opacity-0 hover:opacity-100 transition"
          >
            {currentIndex > 0 && (
              <span className="p-1.5 rounded-full bg-black/40 text-white">
                <ChevronLeft className="w-5 h-5" />
              </span>
            )}
          </div>
          <div 
            onClick={handleNext}
            className="absolute right-0 inset-y-0 w-1/3 cursor-pointer z-20 flex items-center justify-end pr-2 opacity-0 hover:opacity-100 transition"
          >
            <span className="p-1.5 rounded-full bg-black/40 text-white">
              <ChevronRight className="w-5 h-5" />
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="absolute bottom-3 inset-x-3 z-30 flex items-center justify-between gap-2">
          <div className="flex-1 bg-black/40 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/20 text-xs text-white/80">
            {currentStory?.caption || 'Story'}
          </div>
          <div className="flex items-center gap-1.5">
            {['❤️', '🔥', '😂', '👏'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReact(emoji)}
                className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-sm hover:scale-125 active:scale-95 transition"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
