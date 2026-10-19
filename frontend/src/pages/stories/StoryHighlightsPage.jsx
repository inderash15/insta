import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import { Sparkles, Plus, Play } from 'lucide-react';

export default function StoryHighlightsPage() {
  const [highlights, setHighlights] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('insta_user_highlights') || '[]');
    } catch {
      return [];
    }
  });
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newHl = {
      _id: Date.now().toString(),
      title: newTitle.trim(),
      coverUrl: '',
      count: 0
    };
    const updated = [newHl, ...highlights];
    setHighlights(updated);
    try {
      localStorage.setItem('insta_user_highlights', JSON.stringify(updated));
    } catch {}
    setNewTitle('');
    setShowModal(false);
  };

  return (
    <div className="max-w-xl mx-auto py-6 px-4 space-y-6 text-neutral-100">
      <PageHeader
        title="Story Highlights"
        subtitle="Pinned permanent story collections displayed on your profile header."
        showBack
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl insta-story-gradient text-white text-xs font-semibold shadow-md shadow-pink-500/20 hover:opacity-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Highlight</span>
          </button>
        }
      />

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-neutral-900 border border-neutral-800 p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">New Highlight</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                type="text"
                placeholder="Highlight name (e.g. Vacation, Pets)..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                autoFocus
                className="w-full py-2.5 px-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-pink-500"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="px-4 py-2 rounded-xl insta-story-gradient text-xs font-semibold text-white shadow-md shadow-pink-500/20"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {highlights.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No highlights yet"
          description="Keep your favorite stories on your profile permanently by creating a highlight."
        />
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {highlights.map((hl) => (
            <Link
              key={hl._id}
              to={`/stories/highlights/${hl._id}`}
              className="flex flex-col items-center gap-2 group text-center"
            >
              <div className="w-20 h-20 rounded-full p-0.5 border-2 border-neutral-700 group-hover:border-pink-500 transition">
                <div className="w-full h-full rounded-full overflow-hidden bg-neutral-800 flex items-center justify-center">
                  {hl.coverUrl ? (
                    <img src={hl.coverUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition" />
                  ) : (
                    <Sparkles className="w-6 h-6 text-pink-400" />
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-white group-hover:text-pink-400 transition">{hl.title}</p>
                <p className="text-[10px] text-neutral-500">{hl.count} stories</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
