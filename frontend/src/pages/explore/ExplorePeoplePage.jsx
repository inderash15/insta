import React, { useState, useEffect } from 'react';
import { Users, UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import ExploreNav from '../../components/explore/ExploreNav';

export default function ExplorePeoplePage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followingMap, setFollowingMap] = useState({});

  useEffect(() => {
    const fetchSuggestedPeople = async () => {
      setLoading(true);
      try {
        const res = await api.get('/search/users?q=a&limit=30');
        if (res.data?.success) {
          setUsers(res.data.users || []);
        }
      } catch (err) {
        console.error('Discover people error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestedPeople();
  }, []);

  const handleToggleFollow = async (userId) => {
    const isCurrentlyFollowing = followingMap[userId];
    setFollowingMap((prev) => ({ ...prev, [userId]: !isCurrentlyFollowing }));

    try {
      if (isCurrentlyFollowing) {
        await api.delete(`/users/${userId}/follow`);
      } else {
        await api.post(`/users/${userId}/follow`);
      }
    } catch {
      setFollowingMap((prev) => ({ ...prev, [userId]: isCurrentlyFollowing }));
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-6 px-4 space-y-6">
      <ExploreNav />

      <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
        <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-400">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-base font-bold text-neutral-100">Suggested For You</h1>
          <p className="text-xs text-neutral-400">Discover and follow people in the Insta community</p>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
          <p className="text-xs text-neutral-500">Finding creators for you...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="py-24 text-center space-y-2">
          <p className="text-xs text-neutral-400">No suggestions right now</p>
          <p className="text-[11px] text-neutral-500">Check back later as new creators join!</p>
        </div>
      ) : (
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl divide-y divide-neutral-800/60 overflow-hidden">
          {users.map((u) => {
            const isFollowing = followingMap[u._id];
            return (
              <div
                key={u._id}
                className="p-4 flex items-center justify-between hover:bg-neutral-800/40 transition-colors"
              >
                <Link to={`/users/${u.username}`} className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-neutral-800 overflow-hidden flex items-center justify-center font-bold text-sm text-white border border-neutral-700">
                    {u.avatarUrl ? (
                      <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      u.username[0]?.toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-200 hover:underline">
                      @{u.username}
                    </p>
                    <p className="text-[11px] text-neutral-400">{u.fullName}</p>
                    {u.isPrivate && (
                      <span className="text-[10px] text-amber-400/90 font-medium">Private Account</span>
                    )}
                  </div>
                </Link>

                <button
                  onClick={() => handleToggleFollow(u._id)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isFollowing
                      ? 'bg-neutral-800 text-neutral-300 hover:bg-red-500/20 hover:text-red-400 border border-neutral-700'
                      : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-90 shadow-sm'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
