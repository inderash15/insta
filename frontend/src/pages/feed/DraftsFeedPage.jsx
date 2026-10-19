import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FeedTabNav from '../../components/feed/FeedTabNav';
import EmptyState from '../../components/common/EmptyState';
import { FileEdit, Trash2, ArrowUpRight } from 'lucide-react';

export default function DraftsFeedPage() {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('insta_post_drafts') || '[]');
    } catch {
      return [];
    }
  });

  const handleDelete = (id) => {
    const updated = drafts.filter((d) => d.id !== id);
    setDrafts(updated);
    localStorage.setItem('insta_post_drafts', JSON.stringify(updated));
  };

  return (
    <div className="w-full max-w-xl mx-auto py-4 px-2 sm:px-4 space-y-4">
      <FeedTabNav />

      <div className="flex items-center justify-between pb-2">
        <h2 className="text-sm font-bold text-white">Your Post Drafts</h2>
        <Link
          to="/create/post"
          className="text-xs text-pink-400 hover:text-pink-300 font-semibold transition"
        >
          + New Post
        </Link>
      </div>

      {drafts.length === 0 ? (
        <EmptyState
          icon={FileEdit}
          title="No post drafts saved"
          description="When you start creating a post and choose to save as draft, you can resume editing it here."
          actionLabel="Create New Post"
          actionLink="/create/post"
        />
      ) : (
        <div className="space-y-3">
          {drafts.map((draft) => (
            <div
              key={draft.id}
              className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                {draft.mediaUrl && (
                  <img src={draft.mediaUrl} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0 border border-neutral-700" />
                )}
                <div className="min-w-0">
                  <p className="text-xs text-white font-medium truncate">{draft.caption}</p>
                  <p className="text-[10px] text-neutral-500 mt-1">
                    Saved {new Date(draft.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to="/create/post"
                  className="p-2 rounded-xl bg-neutral-800 text-white hover:bg-neutral-700 transition"
                  title="Resume Editing"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleDelete(draft.id)}
                  className="p-2 rounded-xl bg-neutral-900 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 transition"
                  title="Discard Draft"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
