import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import { Eye, Heart } from 'lucide-react';

export default function StoryViewersPage() {
  const { storyId } = useParams();
  const [viewers, setViewers] = useState([]);
  const [reactions, setReactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadViewers() {
      try {
        setLoading(true);
        if (storyId && storyId !== 'sample') {
          const res = await api.get(`/stories/${storyId}/viewers`);
          if (res.data?.success) {
            setViewers(res.data.viewers || []);
            setReactions(res.data.reactions || []);
          }
        } else {
          setViewers([
            { user: { _id: '1', username: 'maya', fullName: 'Maya Lin', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150' }, viewedAt: new Date() },
            { user: { _id: '2', username: 'alex', fullName: 'Alex Rivera', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' }, viewedAt: new Date() }
          ]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadViewers();
  }, [storyId]);

  return (
    <div className="max-w-xl mx-auto py-6 px-4 space-y-6 text-neutral-100">
      <PageHeader
        title="Story Viewers"
        subtitle={`${viewers.length} followers have watched this 24-hour update.`}
        showBack
      />

      {loading ? (
        <LoadingSkeleton type="list" count={3} />
      ) : viewers.length === 0 ? (
        <EmptyState
          icon={Eye}
          title="No views yet"
          description="Your followers haven't inspected this story yet."
        />
      ) : (
        <div className="divide-y divide-neutral-800 rounded-3xl border border-neutral-800 bg-neutral-900/40 overflow-hidden">
          {viewers.map((item, idx) => (
            <div key={idx} className="p-3.5 flex items-center justify-between gap-3">
              <Link to={`/users/${item.user?.username}`} className="flex items-center gap-3 min-w-0 group">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-neutral-700 bg-neutral-800 shrink-0">
                  {item.user?.avatarUrl ? (
                    <img src={item.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-neutral-400">
                      {item.user?.username?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white group-hover:text-pink-400 transition truncate">
                    {item.user?.fullName || item.user?.username}
                  </p>
                  <p className="text-[11px] text-neutral-400 truncate">@{item.user?.username}</p>
                </div>
              </Link>

              <span className="text-[10px] text-neutral-500">
                {new Date(item.viewedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
