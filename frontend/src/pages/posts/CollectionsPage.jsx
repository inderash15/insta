import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import { Layers, Plus, Bookmark, Trash2 } from 'lucide-react';

export default function CollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

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

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim() || creating) return;

    try {
      setCreating(true);
      const res = await api.post('/settings/collections', { name: newName.trim() });
      if (res.data?.success) {
        setCollections((prev) => [res.data.collection, ...prev]);
        setNewName('');
        setShowCreateModal(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6 text-neutral-100">
      <PageHeader
        title="Collections"
        subtitle="Saved posts neatly categorized into curated moodboards."
        showBack
        actions={
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl insta-story-gradient text-white text-xs font-semibold shadow-md shadow-pink-500/20 hover:opacity-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Collection</span>
          </button>
        }
      />

      {/* New Collection Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-neutral-900 border border-neutral-800 p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">New Collection</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                type="text"
                placeholder="Collection name..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
                className="w-full py-2.5 px-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-pink-500"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newName.trim()}
                  className="px-4 py-2 rounded-xl insta-story-gradient text-xs font-semibold text-white shadow-md shadow-pink-500/20"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingSkeleton type="grid" count={4} />
      ) : collections.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No custom collections yet"
          description="Group your saved posts into collections like 'Architecture', 'Style', or 'Recipes'."
          actionLabel="Create Collection"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {/* Default All Posts Card */}
          <Link
            to="/feed/saved"
            className="p-5 rounded-3xl bg-neutral-900/60 border border-neutral-800 hover:border-pink-500/40 transition space-y-3 flex flex-col justify-between"
          >
            <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-500 flex items-center justify-center">
              <Bookmark className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">All Posts</h3>
              <p className="text-[11px] text-neutral-400">All bookmarks</p>
            </div>
          </Link>

          {/* Custom User Collections */}
          {collections.map((col) => (
            <Link
              key={col._id}
              to={`/collections/${col._id}`}
              className="p-5 rounded-3xl bg-neutral-900/40 border border-neutral-800 hover:border-pink-500/40 transition space-y-3 flex flex-col justify-between"
            >
              <div className="w-12 h-12 rounded-2xl bg-neutral-800 border border-neutral-700 text-white flex items-center justify-center font-bold text-sm">
                {col.name[0]?.toUpperCase()}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white truncate">{col.name}</h3>
                <p className="text-[11px] text-neutral-400">{col.posts?.length || 0} saved</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
