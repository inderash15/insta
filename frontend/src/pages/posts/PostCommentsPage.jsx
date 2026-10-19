import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import { MessageCircle, Heart, Trash2, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function PostCommentsPage() {
  const { postId } = useParams();
  const { user } = useAuth();

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadComments() {
      try {
        setLoading(true);
        const res = await api.get(`/posts/${postId}/comments`);
        if (res.data?.success) {
          setComments(res.data.comments || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadComments();
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    try {
      setSubmitting(true);
      const res = await api.post(`/posts/${postId}/comments`, { content: newComment.trim() });
      if (res.data?.success) {
        setComments((prev) => [...prev, res.data.comment]);
        setNewComment('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await api.delete(`/posts/${postId}/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-6 px-4 space-y-6 text-neutral-100 flex flex-col min-h-[80vh]">
      <PageHeader
        title="Comments"
        subtitle="Full conversation thread and community remarks."
        showBack
      />

      <div className="flex-1 space-y-4">
        {loading ? (
          <LoadingSkeleton type="list" count={4} />
        ) : comments.length === 0 ? (
          <EmptyState
            icon={MessageCircle}
            title="No comments yet"
            description="Start the conversation by sharing your thoughts below."
          />
        ) : (
          <div className="divide-y divide-neutral-800 rounded-3xl border border-neutral-800 bg-neutral-900/40 p-2 overflow-hidden">
            {comments.map((comment) => (
              <div key={comment._id} className="p-3.5 flex items-start justify-between gap-3 text-xs">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-neutral-800 border border-neutral-700 shrink-0">
                    {comment.author?.avatarUrl ? (
                      <img src={comment.author.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-neutral-400">
                        {comment.author?.username?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p className="text-white">
                      <Link to={`/users/${comment.author?.username}`} className="font-bold hover:underline mr-1.5">
                        @{comment.author?.username || 'user'}
                      </Link>
                      <span className="text-neutral-200">{comment.content}</span>
                    </p>
                    <p className="text-[10px] text-neutral-500">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {user?._id === comment.author?._id && (
                  <button
                    onClick={() => handleDelete(comment._id)}
                    className="p-1 text-neutral-500 hover:text-red-400 transition"
                    title="Delete Comment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sticky Comment Composer */}
      <form onSubmit={handleSubmit} className="sticky bottom-4 p-2 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center gap-2 shadow-2xl backdrop-blur">
        <input
          type="text"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="flex-1 py-2 px-3 bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={submitting || !newComment.trim()}
          className="p-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 disabled:opacity-40 text-white transition flex items-center justify-center"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
