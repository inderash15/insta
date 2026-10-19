import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import { Archive, Plus, Sparkles } from 'lucide-react';

export default function StoryArchivePage() {
  const [archivedStories, setArchivedStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadArchive() {
      try {
        setLoading(true);
        // Load past stories
        setArchivedStories([
          { _id: 'arc1', mediaUrl: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=500', date: 'Yesterday' },
          { _id: 'arc2', mediaUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500', date: '3 days ago' },
          { _id: 'arc3', mediaUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500', date: 'Last week' }
        ]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadArchive();
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6 text-neutral-100">
      <PageHeader
        title="Story Archive"
        subtitle="Your private vault of past 24-hour stories. Only you can view these."
        showBack
        actions={
          <Link
            to="/stories/highlights"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>Manage Highlights</span>
          </Link>
        }
      />

      {loading ? (
        <LoadingSkeleton type="grid" count={6} />
      ) : archivedStories.length === 0 ? (
        <EmptyState
          icon={Archive}
          title="No archived stories"
          description="Stories you publish automatically save to this private archive after 24 hours."
        />
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {archivedStories.map((story) => (
            <div
              key={story._id}
              className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 group"
            >
              <img src={story.mediaUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2 text-[10px] text-neutral-300">
                <span>{story.date}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
