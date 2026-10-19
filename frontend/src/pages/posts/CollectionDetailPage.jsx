import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import { Layers, Trash2 } from 'lucide-react';

export default function CollectionDetailPage() {
  const { collectionId } = useParams();
  const navigate = useNavigate();

  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCollection() {
      try {
        setLoading(true);
        const res = await api.get(`/settings/collections/${collectionId}`);
        if (res.data?.success) {
          setCollection(res.data.collection);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCollection();
  }, [collectionId]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this collection? Saved posts will remain in your saved archive.')) return;
    try {
      await api.delete(`/settings/collections/${collectionId}`);
      navigate('/collections');
    } catch (err) {
      alert('Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4">
        <LoadingSkeleton type="grid" count={6} />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <p className="text-sm text-neutral-400">Collection not found</p>
        <Link to="/collections" className="text-xs text-pink-400 hover:underline">
          ← Back to collections
        </Link>
      </div>
    );
  }

  const posts = collection.posts || [];

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6 text-neutral-100">
      <PageHeader
        title={collection.name}
        subtitle={`${posts.length} saved items inside this folder.`}
        showBack
        actions={
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-semibold text-red-400 hover:bg-neutral-800 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Collection</span>
          </button>
        }
      />

      {posts.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="Empty Collection"
          description="Bookmark posts to add them to this collection."
          actionLabel="Explore Feed"
          actionLink="/explore"
        />
      ) : (
        <div className="grid grid-cols-3 gap-1 sm:gap-4">
          {posts.map((post) => (
            <Link
              key={post._id}
              to={`/posts/${post._id}`}
              className="relative aspect-square group overflow-hidden rounded-xl sm:rounded-2xl bg-neutral-900"
            >
              <img
                src={post.media?.[0]?.url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500'}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold gap-3">
                <span>View</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
