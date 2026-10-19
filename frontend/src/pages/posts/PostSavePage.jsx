import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import { Bookmark, Plus, Check, Loader2 } from 'lucide-react';

export default function PostSavePage() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [collections, setCollections] = useState([]);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [selectedColId, setSelectedColId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadCollections() {
      try {
        setLoading(true);
        const res = await api.get('/settings/collections');
        if (res.data?.success) {
          setCollections(res.data.collections || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCollections();
  }, []);

  const handleSaveToCollection = async (collectionId) => {
    try {
      setSubmitting(true);
      await api.post(`/posts/${postId}/save`);
      setSaved(true);
      setTimeout(() => navigate(`/posts/${postId}`), 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateAndSave = async (e) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;

    try {
      setSubmitting(true);
      const res = await api.post('/settings/collections', {
        name: newCollectionName.trim(),
        postId
      });
      if (res.data?.success) {
        setSaved(true);
        setTimeout(() => navigate(`/posts/${postId}`), 1200);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-6 px-4 space-y-6 text-neutral-100">
      <PageHeader
        title="Save to Collection"
        subtitle="Organize bookmarked inspiration into custom thematic folders."
        showBack
      />

      {saved && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-900/60 text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Saved to collection!</span>
        </div>
      )}

      {/* Save to All Bookmarks */}
      <button
        onClick={() => handleSaveToCollection('all')}
        disabled={submitting}
        className="w-full p-4 rounded-3xl bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800 flex items-center justify-between text-xs font-semibold text-white transition"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-500 flex items-center justify-center">
            <Bookmark className="w-5 h-5 fill-current" />
          </div>
          <div className="text-left">
            <p className="font-bold">All Saved Posts</p>
            <p className="text-[10px] text-neutral-400 font-normal">Default personal archive</p>
          </div>
        </div>
        <Check className="w-4 h-4 text-neutral-400" />
      </button>

      {/* Create New Collection Inline */}
      <div className="p-4 rounded-3xl bg-neutral-900/40 border border-neutral-800 space-y-3">
        <h4 className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-pink-400" />
          <span>New Collection</span>
        </h4>

        <form onSubmit={handleCreateAndSave} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Collection name (e.g. Design, Travel)..."
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            className="flex-1 py-2 px-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500"
          />
          <button
            type="submit"
            disabled={submitting || !newCollectionName.trim()}
            className="py-2 px-3.5 rounded-xl insta-story-gradient disabled:opacity-40 text-white text-xs font-semibold transition"
          >
            Create
          </button>
        </form>
      </div>

      {/* Existing Custom Collections */}
      {collections.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Your Collections</h4>
          <div className="space-y-2">
            {collections.map((col) => (
              <button
                key={col._id}
                onClick={() => handleSaveToCollection(col._id)}
                disabled={submitting}
                className="w-full p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-pink-500/40 text-left text-xs flex items-center justify-between text-white transition"
              >
                <span className="font-semibold">{col.name}</span>
                <span className="text-[11px] text-neutral-500">{col.posts?.length || 0} items</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
