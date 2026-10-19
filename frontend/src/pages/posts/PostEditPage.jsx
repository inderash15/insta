import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import { Check, Loader2 } from 'lucide-react';

export default function PostEditPage() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadPost() {
      try {
        setLoading(true);
        const res = await api.get(`/posts/${postId}`);
        if (res.data?.success) {
          setPost(res.data.post);
          setCaption(res.data.post.caption || '');
        }
      } catch (err) {
        setError('Post not found');
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [postId]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      await api.put(`/posts/${postId}`, { caption });
      setSuccess(true);
      setTimeout(() => navigate(`/posts/${postId}`), 1200);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update post');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-6 px-4 space-y-6 text-neutral-100">
      <PageHeader
        title="Edit Post"
        subtitle="Modify caption, descriptions, and hashtags for this publication."
        showBack
      />

      {success && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-900/60 text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Post updated successfully!</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-900/60 text-red-300 text-xs">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-xs text-neutral-500 animate-pulse">Loading post...</div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {post?.media?.[0]?.url && (
            <div className="w-32 h-32 rounded-2xl overflow-hidden border border-neutral-800 mx-auto">
              <img src={post.media[0].url} alt="" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="edit-caption" className="block text-xs font-semibold text-neutral-300">
              Caption
            </label>
            <textarea
              id="edit-caption"
              rows={4}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 focus:border-pink-500 focus:outline-none text-xs text-white resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 px-4 rounded-2xl insta-story-gradient text-white text-xs font-semibold shadow-lg shadow-pink-500/20 hover:opacity-95 transition flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Update Post</span>}
          </button>
        </form>
      )}
    </div>
  );
}
