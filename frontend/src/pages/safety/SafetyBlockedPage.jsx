import React, { useState, useEffect } from 'react';
import { UserX, Shield, ArrowLeft, Loader2, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function SafetyBlockedPage() {
  const navigate = useNavigate();
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBlocked = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/profile/blocked');
      if (res.data?.success) {
        setBlockedUsers(res.data.blockedUsers || []);
      }
    } catch (err) {
      console.error('Failed to load blocked accounts:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlocked();
  }, []);

  const handleUnblock = async (userId) => {
    try {
      await api.delete(`/users/${userId}/block`);
      setBlockedUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      console.error('Failed to unblock user:', err);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto py-6 px-4 space-y-6">
      <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
        <button
          onClick={() => navigate('/safety')}
          className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-base font-bold text-neutral-100">Blocked Accounts</h1>
          <p className="text-xs text-neutral-400">Blocked users cannot find your profile, posts, or stories</p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-6 h-6 text-pink-500 animate-spin" />
        </div>
      ) : blockedUsers.length === 0 ? (
        <div className="py-20 text-center space-y-2 text-neutral-500 text-xs">
          <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 mx-auto flex items-center justify-center text-neutral-400">
            <UserX className="w-6 h-6" />
          </div>
          <p className="font-semibold text-neutral-300">No blocked accounts</p>
          <p>Accounts you block will appear here. You can unblock them anytime.</p>
        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl divide-y divide-neutral-800/60 overflow-hidden">
          {blockedUsers.map((u) => (
            <div key={u._id} className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-800 overflow-hidden flex items-center justify-center font-bold text-xs text-white">
                  {u.avatarUrl ? (
                    <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    u.username?.[0]?.toUpperCase()
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-200">@{u.username}</p>
                  <p className="text-[11px] text-neutral-400">{u.fullName}</p>
                </div>
              </div>

              <button
                onClick={() => handleUnblock(u._id)}
                className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 transition-colors"
              >
                Unblock
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
