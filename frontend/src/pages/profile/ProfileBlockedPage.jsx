import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import { ShieldAlert, UserCheck } from 'lucide-react';

export default function ProfileBlockedPage() {
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBlocked() {
      try {
        setLoading(true);
        const res = await api.get('/auth/me');
        if (res.data?.user?.blockedUsers) {
          setBlockedUsers(res.data.user.blockedUsers || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadBlocked();
  }, []);

  const handleUnblock = async (targetId) => {
    try {
      await api.post(`/users/${targetId}/block`); // toggles block
      setBlockedUsers((prev) => prev.filter((u) => u !== targetId && u?._id !== targetId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-6 px-4 space-y-6 text-neutral-100">
      <PageHeader
        title="Blocked Accounts"
        subtitle="Blocked accounts cannot see your profile, posts, reels, or message you."
        showBack
      />

      {loading ? (
        <LoadingSkeleton type="list" count={2} />
      ) : blockedUsers.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title="No blocked accounts"
          description="You haven't blocked anyone. You can block accounts from their profile options."
        />
      ) : (
        <div className="divide-y divide-neutral-800 rounded-3xl border border-neutral-800 bg-neutral-900/40 overflow-hidden">
          {blockedUsers.map((item, idx) => {
            const id = typeof item === 'string' ? item : item._id;
            const name = typeof item === 'object' ? item.username : `User #${id.slice(-4)}`;
            return (
              <div key={id || idx} className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-neutral-400">
                    {name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">@{name}</p>
                    <p className="text-[10px] text-neutral-500">Blocked</p>
                  </div>
                </div>

                <button
                  onClick={() => handleUnblock(id)}
                  className="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 hover:text-white transition"
                >
                  Unblock
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
