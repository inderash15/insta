import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Send, Trash2, Loader2, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ReelCommentsPage() {
  const { reelId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [reel, setReel] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchReelAndComments = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/reels/${reelId}`);
      if (res.data?.success) {
        setReel(res.data.reel);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reelId) {
      fetchReelAndComments();
    }
  }, [reelId]);

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    const mockComment = {
      _id: Date.now().toString(),
      text: newComment.trim(),
      author: {
        _id: user?._id,
        username: user?.username || 'You',
        avatarUrl: user?.avatarUrl
      },
      createdAt: new Date().toISOString()
    };

    setComments((prev) => [mockComment, ...prev]);
    setNewComment('');
    setSubmitting(false);
  };

  return (
    <div className="w-full max-w-xl mx-auto py-6 px-4 space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-base font-bold text-neutral-100 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-pink-500" />
            <span>Reel Comments</span>
          </h1>
          {reel && (
            <p className="text-xs text-neutral-400">
              Reel by @{reel.author?.username}
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Comment input form */}
      <form onSubmit={handleAddComment} className="flex gap-2 bg-neutral-900 border border-neutral-800 rounded-2xl p-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment to this reel..."
          className="flex-1 bg-transparent px-3 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!newComment.trim() || submitting}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-semibold disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Post</span>
        </button>
      </form>

      {/* Comments list */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-6 h-6 text-pink-500 animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <div className="py-12 text-center text-neutral-500 text-xs space-y-1">
            <p className="font-semibold text-neutral-300">No comments yet</p>
            <p>Start the conversation and share what you think!</p>
          </div>
        ) : (
          comments.map((c) => (
            <div key={c._id} className="p-3.5 bg-neutral-900/60 border border-neutral-800 rounded-xl flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <Link to={`/users/${c.author?.username}`}>
                  <div className="w-8 h-8 rounded-full bg-neutral-800 overflow-hidden flex items-center justify-center font-bold text-xs text-white">
                    {c.author?.avatarUrl ? (
                      <img src={c.author.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      c.author?.username?.[0]?.toUpperCase()
                    )}
                  </div>
                </Link>
                <div>
                  <div className="flex items-center gap-2">
                    <Link to={`/users/${c.author?.username}`} className="text-xs font-semibold text-neutral-200 hover:underline">
                      @{c.author?.username}
                    </Link>
                    <span className="text-[10px] text-neutral-500">
                      {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 mt-1">{c.text}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
