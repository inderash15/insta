import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import { Film, Play, Plus } from 'lucide-react';

export default function ProfileReelsPage() {
  const { user } = useAuth();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOwnReels() {
      try {
        setLoading(true);
        const res = await api.get('/reels/feed');
        if (res.data?.success) {
          // Filter to user's own reels
          const own = (res.data.reels || []).filter(
            (r) => r.author?._id === user?._id || r.author?.username === user?.username
          );
          setReels(own.length > 0 ? own : res.data.reels || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadOwnReels();
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6 text-neutral-100">
      <PageHeader
        title="My Reels"
        subtitle={`Short-form vertical videos published to your profile.`}
        showBack
        actions={
          <Link
            to="/reels/create"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl insta-story-gradient text-white text-xs font-semibold shadow-md shadow-pink-500/20 hover:opacity-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Reel</span>
          </Link>
        }
      />

      {loading ? (
        <LoadingSkeleton type="grid" count={6} />
      ) : reels.length === 0 ? (
        <EmptyState
          icon={Film}
          title="Share Video Reels"
          description="Create vertical short videos with audio tracks and effects."
          actionLabel="Record or Upload Reel"
          actionLink="/reels/create"
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
          {reels.map((reel) => (
            <Link
              key={reel._id}
              to={`/reels/${reel._id}`}
              className="relative aspect-[9/16] group overflow-hidden rounded-2xl bg-neutral-900 border border-neutral-800"
            >
              {reel.thumbnailUrl ? (
                <img src={reel.thumbnailUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-neutral-950">
                  <Film className="w-8 h-8 text-neutral-600" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3 text-white text-xs">
                <span className="flex items-center gap-1 font-semibold">
                  <Play className="w-3.5 h-3.5 fill-current" /> {reel.viewsCount || 0}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
