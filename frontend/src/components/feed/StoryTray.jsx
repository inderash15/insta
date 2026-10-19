import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StoryViewerModal from '../modals/StoryViewerModal';

export default function StoryTray({ onOpenCreateStory }) {
  const { user } = useAuth();
  const [tray, setTray] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const fetchStories = async () => {
    try {
      const res = await api.get('/stories/feed');
      if (res.data?.success) {
        setTray(res.data.tray || []);
      }
    } catch (err) {
      // Non-fatal
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  return (
    <>
      <div className="w-full bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4 backdrop-blur mb-6">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-1">
          {/* Your Story (+ button) */}
          <div className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group" onClick={onOpenCreateStory}>
            <div className="relative w-16 h-16 rounded-full p-0.5 border-2 border-dashed border-neutral-700 group-hover:border-pink-500 transition">
              <div className="w-full h-full bg-neutral-800 rounded-full flex items-center justify-center font-bold text-sm text-neutral-200 overflow-hidden">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  user?.username?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full insta-story-gradient flex items-center justify-center text-white border-2 border-neutral-900 shadow">
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </div>
            <span className="text-[11px] text-neutral-300 font-medium truncate max-w-[70px]">
              Your story
            </span>
          </div>

          {/* Active Followed Stories */}
          {tray.map((group) => {
            const hasUnviewed = group.hasUnviewed;
            return (
              <div
                key={group.user?._id || group.user?.id}
                onClick={() => setSelectedGroup(group)}
                className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
              >
                <div
                  className={`w-16 h-16 rounded-full p-[2.5px] transition group-hover:scale-105 ${
                    hasUnviewed
                      ? 'insta-story-gradient shadow-md shadow-pink-500/10'
                      : 'bg-neutral-700'
                  }`}
                >
                  <div className="w-full h-full bg-neutral-950 rounded-full p-0.5">
                    <div className="w-full h-full bg-neutral-800 rounded-full flex items-center justify-center font-bold text-sm text-neutral-200 overflow-hidden">
                      {group.user?.avatarUrl ? (
                        <img src={group.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        group.user?.username?.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-[11px] text-neutral-300 font-medium truncate max-w-[70px]">
                  {group.user?.username}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Story Viewer Modal */}
      {selectedGroup && (
        <StoryViewerModal
          storyGroup={selectedGroup}
          isOpen={!!selectedGroup}
          onClose={() => {
            setSelectedGroup(null);
            fetchStories(); // Refresh viewed status
          }}
        />
      )}
    </>
  );
}
