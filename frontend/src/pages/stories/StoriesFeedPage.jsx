import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import { Plus, Play, Sparkles } from 'lucide-react';

export default function StoriesFeedPage() {
  const [tray, setTray] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStoryTray() {
      try {
        setLoading(true);
        const res = await api.get('/stories/tray');
        if (res.data?.success) {
          setTray(res.data.tray || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStoryTray();
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6 text-neutral-100">
      <PageHeader
        title="Active Stories"
        subtitle="Ephemeral 24-hour photos and clips from followed creators."
        showBack
        actions={
          <Link
            to="/stories/create"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl insta-story-gradient text-white text-xs font-semibold shadow-md shadow-pink-500/20 hover:opacity-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Story</span>
          </Link>
        }
      />

      {loading ? (
        <LoadingSkeleton type="grid" count={6} />
      ) : tray.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No active stories right now"
          description="When accounts you follow publish 24-hour updates, they will appear in your stories feed."
          actionLabel="Create Your Story"
          actionLink="/stories/create"
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {tray.map((group) => {
            const author = group.author;
            const firstStory = group.stories?.[0];
            return (
              <Link
                key={author._id}
                to={`/stories/${firstStory?._id || 'view'}`}
                className="relative aspect-[9/16] rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 group hover:scale-[1.02] transition shadow-xl"
              >
                {firstStory?.mediaUrl ? (
                  <img src={firstStory.mediaUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-pink-600 via-purple-600 to-amber-500 opacity-60" />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-between">
                  <div className="w-10 h-10 rounded-full p-0.5 insta-story-gradient shadow-md">
                    <div className="w-full h-full rounded-full overflow-hidden bg-neutral-950 border border-neutral-800">
                      {author.avatarUrl ? (
                        <img src={author.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-xs text-white">
                          {author.username[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-white">
                    <p className="text-xs font-bold truncate">@{author.username}</p>
                    <p className="text-[10px] text-neutral-300 font-medium">
                      {group.stories?.length || 1} new {group.stories?.length === 1 ? 'story' : 'stories'}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
