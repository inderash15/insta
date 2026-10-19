import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import { UserCheck, Check, X } from 'lucide-react';

export default function ProfileRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRequests() {
      try {
        setLoading(true);
        const res = await api.get('/users/requests/pending');
        if (res.data?.success) {
          setRequests(res.data.requests || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadRequests();
  }, []);

  const handleRespond = async (requestId, action) => {
    try {
      if (action === 'accept') {
        await api.post(`/users/requests/${requestId}/accept`);
      } else {
        await api.post(`/users/requests/${requestId}/reject`);
      }
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-6 px-4 space-y-6 text-neutral-100">
      <PageHeader
        title="Follow Requests"
        subtitle="Accounts that requested to follow your private profile."
        showBack
      />

      {loading ? (
        <LoadingSkeleton type="list" count={3} />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No pending requests"
          description="When users request to follow your private account, they will appear here for review."
        />
      ) : (
        <div className="divide-y divide-neutral-800 rounded-3xl border border-neutral-800 bg-neutral-900/40 overflow-hidden">
          {requests.map((req) => (
            <div key={req._id} className="p-4 flex items-center justify-between gap-3">
              <Link to={`/users/${req.follower?.username}`} className="flex items-center gap-3 min-w-0 group">
                <div className="w-11 h-11 rounded-full overflow-hidden border border-neutral-700 bg-neutral-800 shrink-0">
                  {req.follower?.avatarUrl ? (
                    <img src={req.follower.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-neutral-400">
                      {req.follower?.username?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white group-hover:text-pink-400 transition truncate">
                    {req.follower?.fullName || req.follower?.username}
                  </p>
                  <p className="text-[11px] text-neutral-400 truncate">@{req.follower?.username}</p>
                </div>
              </Link>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleRespond(req._id, 'accept')}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition flex items-center gap-1 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirm</span>
                </button>
                <button
                  onClick={() => handleRespond(req._id, 'reject')}
                  className="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 hover:text-white transition flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
