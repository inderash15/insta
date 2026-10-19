import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import { Users, UserMinus, Search } from 'lucide-react';

export default function ProfileFollowersPage() {
  const { user } = useAuth();
  const [followers, setFollowers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFollowers() {
      try {
        setLoading(true);
        if (user?._id) {
          const res = await api.get(`/users/${user._id}/followers`);
          if (res.data?.success) {
            setFollowers(res.data.followers || []);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadFollowers();
  }, [user]);

  const filtered = followers.filter((f) =>
    f.username?.toLowerCase().includes(search.toLowerCase()) ||
    f.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-xl mx-auto py-6 px-4 space-y-6 text-neutral-100">
      <PageHeader
        title="Followers"
        subtitle={`People following your profile and receiving your updates.`}
        showBack
      />

      <div className="relative">
        <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search followers..."
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
          title="No followers yet"
          description="When accounts follow you, they'll be listed here."
          actionLabel="Find People"
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

              <Link
                to={`/users/${item.username}`}
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
