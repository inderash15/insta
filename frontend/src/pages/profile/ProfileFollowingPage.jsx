import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import { Users, Search } from 'lucide-react';

export default function ProfileFollowingPage() {
  const { user } = useAuth();
  const [following, setFollowing] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFollowing() {
      try {
        setLoading(true);
        if (user?._id) {
          const res = await api.get(`/users/${user._id}/following`);
          if (res.data?.success) {
            setFollowing(res.data.following || []);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadFollowing();
  }, [user]);

  const handleUnfollow = async (targetId) => {
    try {
      await api.post(`/users/${targetId}/unfollow`);
      setFollowing((prev) => prev.filter((f) => f._id !== targetId));
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = following.filter((f) =>
    f.username?.toLowerCase().includes(search.toLowerCase()) ||
    f.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-xl mx-auto py-6 px-4 space-y-6 text-neutral-100">
      <PageHeader
        title="Following"
        subtitle={`Creators and accounts whose updates appear in your following feed.`}
        showBack
      />

      <div className="relative">
        <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search accounts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500"
        />
      </div>

      {loading ? (
        <LoadingSkeleton type="list" count={4} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Not following anyone yet"
          description="Discover creators across photography, art, and travel to start following."
          actionLabel="Explore Creators"
          actionLink="/explore/people"
        />
      ) : (
        <div className="divide-y divide-neutral-800 rounded-3xl border border-neutral-800 bg-neutral-900/40 overflow-hidden">
          {filtered.map((item) => (
            <div key={item._id} className="p-3.5 flex items-center justify-between gap-3">
              <Link to={`/users/${item.username}`} className="flex items-center gap-3 min-w-0 group">
                <div className="w-11 h-11 rounded-full overflow-hidden border border-neutral-700 bg-neutral-800 shrink-0">
                  {item.avatarUrl ? (
                    <img src={item.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-neutral-400">
                      {item.username?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white group-hover:text-pink-400 transition truncate">
                    {item.fullName || item.username}
                  </p>
                  <p className="text-[11px] text-neutral-400 truncate">@{item.username}</p>
                </div>
              </Link>

              <button
                onClick={() => handleUnfollow(item._id)}
                className="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 hover:text-red-400 transition"
              >
                Following
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
