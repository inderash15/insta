import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import StoryViewerModal from '../modals/StoryViewerModal';

export default function StoryTray({ onOpenCreateStory }) {
  const { user } = useAuth();
  const { socket } = useSocket();
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

  useEffect(() => {
    if (!socket) return;

    const handleStoryUpdate = () => {
      fetchStories();
    };

    socket.on('story:created', handleStoryUpdate);
    socket.on('story:deleted', handleStoryUpdate);

    return () => {
      socket.off('story:created', handleStoryUpdate);
      socket.off('story:deleted', handleStoryUpdate);
    };
  }, [socket]);

  const myId = (user?._id || user?.id)?.toString();
  const myUsername = user?.username?.toLowerCase();

  const isGroupSelf = (group) => {
    if (group.isSelf) return true;
    const author = group.author || group.user;
    const authorId = (author?._id || author?.id)?.toString();
    const authorUsername = author?.username?.toLowerCase();
    if (myId && authorId && myId === authorId) return true;
    if (myUsername && authorUsername && myUsername === authorUsername) return true;
    return false;
  };

  const myStoryGroup = tray.find(isGroupSelf);
  const otherStoryGroups = tray.filter((group) => !isGroupSelf(group));
  const hasMyStories = Boolean(myStoryGroup && myStoryGroup.stories?.length > 0);

  return (
    <>
      <div className="w-full bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4 backdrop-blur mb-6">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-1">
          {/* Your Story Avatar Bubble */}
          <div
            className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
            onClick={() => {
              if (hasMyStories) {
                setSelectedGroup(myStoryGroup);
              } else {
                onOpenCreateStory?.();
              }
            }}
          >
            <div
              className={`relative w-16 h-16 rounded-full transition group-hover:scale-105 ${
                hasMyStories
                  ? myStoryGroup?.hasCloseFriends
                    ? 'bg-gradient-to-tr from-emerald-500 to-green-400 p-[2.5px] shadow-md shadow-emerald-500/10'
                    : 'insta-story-gradient p-[2.5px] shadow-md shadow-pink-500/10'
                  : 'p-0.5 border-2 border-dashed border-neutral-700 group-hover:border-pink-500'
              }`}
            >
              <div className={`w-full h-full rounded-full flex items-center justify-center font-bold text-sm text-neutral-200 overflow-hidden ${hasMyStories ? 'bg-neutral-950 p-0.5' : 'bg-neutral-800'}`}>
                <div className="w-full h-full bg-neutral-800 rounded-full flex items-center justify-center overflow-hidden">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    user?.username?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
              </div>

              {/* Plus Badge to Add Story */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenCreateStory?.();
                }}
                title={hasMyStories ? 'Add another story' : 'Create a story'}
                className="absolute bottom-0 right-0 w-5 h-5 rounded-full insta-story-gradient flex items-center justify-center text-white border-2 border-neutral-900 shadow hover:scale-110 active:scale-95 transition"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </div>
            <span className="text-[11px] text-neutral-300 font-medium truncate max-w-[70px]">
              Your story
            </span>
          </div>

          {/* Active Followed Stories (excluding current user) */}
          {otherStoryGroups.map((group) => {
            const author = group.author || group.user;
            const hasUnviewed = group.hasUnviewed;
            const authorId = author?._id || author?.id;
            return (
              <div
                key={authorId}
                onClick={() => setSelectedGroup(group)}
                className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
              >
                <div
                  className={`w-16 h-16 rounded-full p-[2.5px] transition group-hover:scale-105 ${
                    hasUnviewed
                      ? group.hasCloseFriends
                        ? 'bg-gradient-to-tr from-emerald-500 to-green-400 shadow-md shadow-emerald-500/10'
                        : 'insta-story-gradient shadow-md shadow-pink-500/10'
                      : 'bg-neutral-700'
                  }`}
                >
                  <div className="w-full h-full bg-neutral-950 rounded-full p-0.5">
                    <div className="w-full h-full bg-neutral-800 rounded-full flex items-center justify-center font-bold text-sm text-neutral-200 overflow-hidden">
                      {author?.avatarUrl ? (
                        <img src={author.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        author?.username?.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-[11px] text-neutral-300 font-medium truncate max-w-[70px]">
                  {author?.username}
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
