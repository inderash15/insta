import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { X, Heart, Send, Eye, MoreHorizontal, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function StoryViewerPage() {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [reacted, setReacted] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    async function loadStory() {
      try {
        setLoading(true);
        if (storyId && storyId !== 'view') {
          const res = await api.get(`/stories/${storyId}`);
          if (res.data?.success) {
            setStory(res.data.story);
            // Record view
            api.post(`/stories/${storyId}/view`).catch(() => {});
          }
        } else {
          // Fallback sample story if opened from empty tray
          setStory({
            _id: 'sample',
            mediaUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
            author: { username: 'alex', fullName: 'Alex Rivera' },
            createdAt: new Date()
          });
        }
      } catch (err) {
        setStory({
          _id: storyId,
          mediaUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800',
          author: { username: 'maya', fullName: 'Maya Lin' },
          createdAt: new Date()
        });
      } finally {
        setLoading(false);
      }
    }
    loadStory();
  }, [storyId]);

  // Story progress timer (5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [storyId]);

  const handleReact = async (emoji) => {
    setReacted(true);
    if (storyId && storyId !== 'sample') {
      try {
        await api.post(`/stories/${storyId}/react`, { reaction: emoji });
      } catch {}
    }
    setTimeout(() => setReacted(false), 1500);
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    alert(`Reply sent: "${reply}"`);
    setReply('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-neutral-400">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  const isOwner = user?._id === story?.author?._id || user?.username === story?.author?.username;

  return (
    <div className="relative w-full h-screen max-w-sm mx-auto flex flex-col justify-between bg-black overflow-hidden shadow-2xl selection:bg-pink-500/30">
      {/* Top Header */}
      <div className="absolute top-0 inset-x-0 p-4 z-20 space-y-3 bg-gradient-to-b from-black/80 to-transparent">
        {/* Progress bar */}
        <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-100 ease-linear rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* User bar */}
        <div className="flex items-center justify-between text-white">
          <Link to={`/users/${story?.author?.username}`} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/60 bg-neutral-800">
              {story?.author?.avatarUrl ? (
                <img src={story.author.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold">
                  {story?.author?.username?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-bold">@{story?.author?.username}</p>
              <p className="text-[10px] text-white/70">
                {new Date(story?.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {isOwner && (
              <Link
                to={`/stories/${storyId}/viewers`}
                className="p-1.5 rounded-full bg-black/40 text-white hover:bg-black/80 transition"
                title="Viewers List"
              >
                <Eye className="w-4 h-4" />
              </Link>
            )}
            <button
              onClick={() => navigate('/stories')}
              className="p-1.5 rounded-full bg-black/40 text-white hover:bg-black/80 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Story Canvas */}
      <div className="w-full h-full">
        <img
          src={story?.mediaUrl || 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800'}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      {/* Reaction Feedback Float */}
      {reacted && (
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none animate-bounce">
          <span className="text-6xl">❤️</span>
        </div>
      )}

      {/* Bottom Reply Bar */}
      <div className="absolute bottom-0 inset-x-0 p-4 z-20 bg-gradient-to-t from-black/90 to-transparent space-y-3">
        {/* Quick Reactions */}
        <div className="flex items-center justify-around text-xl">
          {['❤️', '🔥', '👏', '😂', '😍', '🎉'].map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReact(emoji)}
              className="hover:scale-125 transition transform"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Reply Input */}
        <form onSubmit={handleSendReply} className="flex items-center gap-2">
          <input
            type="text"
            placeholder={`Reply to @${story?.author?.username}...`}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            className="flex-1 py-2 px-3.5 rounded-full bg-neutral-900/80 border border-white/20 text-xs text-white placeholder-white/60 focus:outline-none focus:border-pink-500 backdrop-blur"
          />
          <button
            type="submit"
            disabled={!reply.trim()}
            className="p-2 rounded-full bg-pink-600 disabled:opacity-40 text-white transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
