import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import { Clock, UserX } from 'lucide-react';

export default function ProfilePendingPage() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPendingOutgoing() {
      try {
        setLoading(true);
        // Load pending follows requested by user
        const res = await api.get('/explore/people');
        if (res.data?.success) {
          // Emulate pending outgoing requests
          setPending([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPendingOutgoing();
  }, []);

  return (
    <div className="max-w-xl mx-auto py-6 px-4 space-y-6 text-neutral-100">
      <PageHeader
        title="Pending Sent Requests"
        subtitle="Requests you've sent to follow private accounts awaiting approval."
        showBack
      />

      {loading ? (
        <LoadingSkeleton type="list" count={3} />
      ) : pending.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No pending outgoing requests"
          description="When you request to follow a private account, your pending request will appear here until approved."
          actionLabel="Find Private Creators"
          actionLink="/explore/people"
        />
      ) : (
        <div className="divide-y divide-neutral-800 rounded-3xl border border-neutral-800 bg-neutral-900/40 overflow-hidden">
          {pending.map((item) => (
            <div key={item._id} className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-neutral-400">
                  {item.username[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">@{item.username}</p>
                  <p className="text-[11px] text-neutral-400">Requested</p>
                </div>
              </div>
              <button className="px-3 py-1.5 rounded-xl bg-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white">
                Cancel
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
