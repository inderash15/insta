import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import { Heart } from 'lucide-react';

export default function PostLikersPage() {
  const { postId } = useParams();
  const [likers, setLikers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLikers() {
      try {
        setLoading(true);
        const res = await api.get(`/posts/${postId}/likers`);
        if (res.data?.success) {
          setLikers(res.data.likers || []);
        }
      } catch (err) {
        console.error('Failed to load post likers:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadLikers();
  }, [postId]);

  return (
    <div className="max-w-xl mx-auto py-6 px-4 space-y-6 text-neutral-100">
      <PageHeader
        title="Likes"
        subtitle="Accounts who liked this post."
        showBack
      />

      {loading ? (
        <LoadingSkeleton type="list" count={3} />
      ) : likers.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No likes yet"
          description="Be the first person to like this post!"
        />
      ) : (
        <div className="divide-y divide-neutral-800 rounded-3xl border border-neutral-800 bg-neutral-900/40 overflow-hidden">
          {likers.map((user) => (
            <div key={user._id} className="p-3.5 flex items-center justify-between gap-3">
              <Link to={`/users/${user.username}`} className="flex items-center gap-3 min-w-0 group">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-neutral-700 bg-neutral-800 shrink-0">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-neutral-400">
                      {user.username?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white group-hover:text-pink-400 transition truncate">
                    {user.fullName || user.username}
                  </p>
                  <p className="text-[11px] text-neutral-400 truncate">@{user.username}</p>
                </div>
              </Link>

              <Link
                to={`/users/${user.username}`}
                className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 transition"
              >
                View
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
