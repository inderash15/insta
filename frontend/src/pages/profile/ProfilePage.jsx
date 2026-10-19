import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Grid, 
  Bookmark, 
  Film, 
  Lock, 
  Settings, 
  Camera, 
  UserCheck, 
  UserPlus, 
  Clock, 
  Loader2, 
  ShieldAlert,
  Heart,
  MessageCircle,
  Tag,
  Users
} from 'lucide-react';
import api, { getMediaUrl } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import EditProfileModal from '../../components/modals/EditProfileModal';
import PostDetailModal from '../../components/modals/PostDetailModal';
import StoryViewerModal from '../../components/modals/StoryViewerModal';

export default function ProfilePage({ username: propUsername, onOpenSettings, onNavigateToMessages }) {
  const { username: routeUsername } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { socket } = useSocket();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [storyGroup, setStoryGroup] = useState(null);
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'reels' | 'saved'
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef(null);

  const usernameToFetch = propUsername || routeUsername || currentUser?.username;
  const isSelf = currentUser?.username?.toLowerCase() === usernameToFetch?.toLowerCase();

  const fetchUserStories = async (userIdOrUsername) => {
    if (!userIdOrUsername) return;
    try {
      const res = await api.get(`/stories/user/${userIdOrUsername}`);
      if (res.data?.success && res.data.storyGroup) {
        setStoryGroup(res.data.storyGroup);
      } else {
        setStoryGroup(null);
      }
    } catch {
      setStoryGroup(null);
    }
  };

  const fetchProfileAndContent = async () => {
    if (!usernameToFetch) return;
    setLoading(true);
    try {
      const profileRes = await api.get(`/users/${usernameToFetch}`);
      if (profileRes.data?.success) {
        setProfile(profileRes.data.profile);

        // Fetch user active stories
        fetchUserStories(profileRes.data.profile._id);

        // Fetch user posts if permitted
        if (profileRes.data.profile.relationship?.canViewContent) {
          const postsRes = await api.get(`/posts/user/${usernameToFetch}`);
          setPosts(postsRes.data?.posts || []);
        }
      }
    } catch (err) {
      console.error('Failed to load profile:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedPosts = async () => {
    if (!isSelf) return;
    try {
      const res = await api.get('/posts/saved');
      setSavedPosts(res.data?.posts || []);
    } catch {}
  };

  useEffect(() => {
    fetchProfileAndContent();
    if (isSelf) {
      fetchSavedPosts();
    }
  }, [usernameToFetch, isSelf]);

  useEffect(() => {
    if (!socket || !profile?._id) return;
    const pId = profile._id.toString();
    const myId = (currentUser?._id || currentUser?.id)?.toString();

    const handleFollowerCount = ({ userId, countChange }) => {
      if (userId?.toString() === pId) {
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                counts: {
                  ...prev.counts,
                  followers: Math.max(0, (prev.counts?.followers || 0) + countChange)
                }
              }
            : prev
        );
      }
    };

    const handleFollowingCount = ({ userId, countChange }) => {
      if (userId?.toString() === pId) {
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                counts: {
                  ...prev.counts,
                  following: Math.max(0, (prev.counts?.following || 0) + countChange)
                }
              }
            : prev
        );
      }
    };

    const handlePostCreated = ({ post }) => {
      if (post && post.author?._id?.toString() === pId) {
        setPosts((prev) => [post, ...prev.filter((p) => p._id !== post._id)]);
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                counts: {
                  ...prev.counts,
                  posts: (prev.counts?.posts || 0) + 1
                }
              }
            : prev
        );
      }
    };

    const handlePostDeleted = ({ postId, authorId }) => {
      if (authorId?.toString() === pId || posts.some((p) => p._id === postId)) {
        setPosts((prev) => prev.filter((p) => p._id !== postId));
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                counts: {
                  ...prev.counts,
                  posts: Math.max(0, (prev.counts?.posts || 1) - 1)
                }
              }
            : prev
        );
      }
    };

    const handleStoryUpdate = () => {
      fetchUserStories(pId);
    };

    socket.on('follower_count_updated', handleFollowerCount);
    socket.on('following_count_updated', handleFollowingCount);
    socket.on('post:created', handlePostCreated);
    socket.on('post:deleted', handlePostDeleted);
    socket.on('story:created', handleStoryUpdate);
    socket.on('story:deleted', handleStoryUpdate);

    return () => {
      socket.off('follower_count_updated', handleFollowerCount);
      socket.off('following_count_updated', handleFollowingCount);
      socket.off('post:created', handlePostCreated);
      socket.off('post:deleted', handlePostDeleted);
      socket.off('story:created', handleStoryUpdate);
      socket.off('story:deleted', handleStoryUpdate);
    };
  }, [socket, profile?._id, currentUser, posts]);

  const handleFollowToggle = async () => {
    if (!profile) return;
    const isFollowing = profile.relationship?.isFollowing;
    const isPending = profile.relationship?.isPending;

    try {
      if (isFollowing || isPending) {
        await api.post(`/users/${profile._id}/unfollow`);
        setProfile((prev) => ({
          ...prev,
          counts: { ...prev.counts, followers: Math.max(0, (prev.counts?.followers || 0) - (isFollowing ? 1 : 0)) },
          relationship: { ...prev.relationship, isFollowing: false, isPending: false, canViewContent: !prev.isPrivate }
        }));
      } else {
        const res = await api.post(`/users/${profile._id}/follow`);
        const newStatus = res.data.status;
        setProfile((prev) => ({
          ...prev,
          counts: { ...prev.counts, followers: (prev.counts?.followers || 0) + (newStatus === 'accepted' ? 1 : 0) },
          relationship: {
            ...prev.relationship,
            isFollowing: newStatus === 'accepted',
            isPending: newStatus === 'pending',
            canViewContent: newStatus === 'accepted' || !prev.isPrivate
          }
        }));
        if (newStatus === 'accepted') {
          const postsRes = await api.get(`/posts/user/${usernameToFetch}`);
          setPosts(postsRes.data?.posts || []);
        }
      }
    } catch (err) {
      alert(err.message || 'Action failed');
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfile((prev) => ({ ...prev, avatarUrl: res.data.avatarUrl }));
    } catch (err) {
      alert(err.message || 'Avatar upload failed');
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
        <p className="text-xs text-neutral-500">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="py-24 text-center space-y-2">
        <h3 className="text-base font-bold text-neutral-100">User Not Found</h3>
        <p className="text-xs text-neutral-500">The link you followed may be broken, or the user has been removed.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 space-y-8">
      {/* Profile Header Card */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 border-b border-neutral-800 pb-8">
        {/* Avatar with Story Ring & upload badge */}
        <div className="relative group shrink-0">
          <div
            onClick={() => {
              if (storyGroup && storyGroup.stories?.length > 0) {
                setIsStoryViewerOpen(true);
              } else if (isSelf) {
                avatarInputRef.current?.click();
              }
            }}
            className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full p-1 transition ${
              storyGroup && storyGroup.stories?.length > 0
                ? storyGroup.hasCloseFriends
                  ? 'bg-gradient-to-tr from-emerald-500 to-green-400 shadow-xl shadow-emerald-500/20 cursor-pointer hover:scale-105'
                  : 'insta-story-gradient shadow-xl shadow-pink-500/20 cursor-pointer hover:scale-105'
                : 'bg-neutral-800'
            }`}
            title={storyGroup && storyGroup.stories?.length > 0 ? 'Click to view story' : isSelf ? 'Click to upload photo' : ''}
          >
            <div className="w-full h-full bg-neutral-950 rounded-full flex items-center justify-center font-bold text-4xl text-neutral-200 uppercase overflow-hidden p-0.5">
              <div className="w-full h-full bg-neutral-800 rounded-full flex items-center justify-center overflow-hidden relative">
                <span className="select-none font-bold text-4xl text-neutral-200 uppercase">
                  {profile.username?.charAt(0) || 'U'}
                </span>
                {profile.avatarUrl && (
                  <img
                    src={getMediaUrl(profile.avatarUrl)}
                    alt=""
                    className="w-full h-full object-cover absolute inset-0"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Change Avatar Button for Own Profile */}
          {isSelf && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                avatarInputRef.current?.click();
              }}
              title="Change profile picture"
              className="absolute bottom-1 right-1 p-2 rounded-full bg-neutral-900 border-2 border-neutral-800 hover:border-pink-500 text-neutral-200 hover:text-white shadow-lg transition active:scale-95"
            >
              {uploadingAvatar ? (
                <Loader2 className="w-4 h-4 animate-spin text-pink-400" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>
          )}

          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
        </div>

        {/* Profile Info & Actions */}
        <div className="flex-1 space-y-4 text-center sm:text-left">
          {/* Row 1: Username & Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <h1 className="text-xl font-bold text-neutral-100 flex items-center justify-center sm:justify-start gap-2">
              <span>{profile.username}</span>
              {profile.isVerified && <span className="text-blue-400 text-xs">✓</span>}
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-400">
                {profile.role}
              </span>
            </h1>

            <div className="flex items-center justify-center gap-2">
              {isSelf ? (
                <>
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition"
                  >
                    Edit profile
                  </button>
                  <button
                    onClick={onOpenSettings}
                    className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
                    title="Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleFollowToggle}
                    className={`px-5 py-1.5 rounded-lg text-xs font-semibold transition shadow ${
                      profile.relationship?.isFollowing
                        ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                        : profile.relationship?.isPending
                        ? 'bg-neutral-800 text-neutral-400'
                        : 'text-white insta-story-gradient hover:opacity-95'
                    }`}
                  >
                    {profile.relationship?.isFollowing
                      ? 'Following'
                      : profile.relationship?.isPending
                      ? 'Requested'
                      : 'Follow'}
                  </button>

                  <button
                    onClick={onNavigateToMessages}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition"
                  >
                    Message
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Row 2: Stats */}
          <div className="flex items-center justify-center sm:justify-start gap-8 text-xs sm:text-sm">
            <div>
              <span className="font-bold text-neutral-100">{profile.counts?.posts || 0}</span>{' '}
              <span className="text-neutral-400">posts</span>
            </div>
            <div>
              <span className="font-bold text-neutral-100">{profile.counts?.followers || 0}</span>{' '}
              <span className="text-neutral-400">followers</span>
            </div>
            <div>
              <span className="font-bold text-neutral-100">{profile.counts?.following || 0}</span>{' '}
              <span className="text-neutral-400">following</span>
            </div>
          </div>

          {/* Row 3: Bio & Website */}
          <div className="space-y-1 text-xs">
            <p className="font-bold text-neutral-100">{profile.fullName}</p>
            {profile.bio && <p className="text-neutral-300 leading-relaxed whitespace-pre-line">{profile.bio}</p>}
            {profile.website && (
              <a
                href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 font-semibold hover:underline block truncate"
              >
                {profile.website}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Private Account Barrier */}
      {!profile.relationship?.canViewContent ? (
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-12 text-center space-y-3">
          <div className="w-16 h-16 rounded-full border-2 border-neutral-700 text-neutral-400 mx-auto flex items-center justify-center">
            <Lock className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h3 className="text-sm font-bold text-neutral-100">This account is private</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Follow @{profile.username} to see their photos and videos.
          </p>
        </div>
      ) : (
        <>
          {/* Tab Navigation */}
          <div className="flex justify-center border-b border-neutral-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('posts')}
              className={`py-3 px-6 flex items-center gap-2 transition ${
                activeTab === 'posts'
                  ? 'border-b-2 border-pink-500 text-pink-500'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>POSTS</span>
            </button>

            {isSelf && (
              <button
                onClick={() => { setActiveTab('saved'); fetchSavedPosts(); }}
                className={`py-3 px-6 flex items-center gap-2 transition ${
                  activeTab === 'saved'
                    ? 'border-b-2 border-pink-500 text-pink-500'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>SAVED</span>
              </button>
            )}
          </div>

          {/* Posts Grid */}
          {activeTab === 'posts' && (
            posts.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <Camera className="w-12 h-12 text-neutral-600 mx-auto stroke-[1.5]" />
                <p className="text-sm font-bold text-neutral-300">No Posts Yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1.5 sm:gap-4">
                {posts.map((post) => (
                  <div
                    key={post._id}
                    onClick={() => setSelectedPostId(post._id)}
                    className="relative aspect-square bg-neutral-900 rounded-lg sm:rounded-xl overflow-hidden cursor-pointer group"
                  >
                    {post.media?.[0]?.type === 'video' ? (
                      <video src={post.media[0].url} className="w-full h-full object-cover" />
                    ) : (
                      <img src={post.media?.[0]?.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    )}

                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-6 text-white text-xs sm:text-sm font-bold transition duration-200">
                      <span className="flex items-center gap-1.5">
                        <Heart className="w-4 h-4 fill-white" />
                        <span>{post.likesCount || 0}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MessageCircle className="w-4 h-4 fill-white" />
                        <span>{post.commentsCount || 0}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Saved Posts Grid */}
          {activeTab === 'saved' && (
            savedPosts.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <Bookmark className="w-12 h-12 text-neutral-600 mx-auto stroke-[1.5]" />
                <p className="text-sm font-bold text-neutral-300">No Saved Posts</p>
                <p className="text-xs text-neutral-500">Save photos and videos that you want to see again.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1.5 sm:gap-4">
                {savedPosts.map((post) => (
                  <div
                    key={post._id}
                    onClick={() => setSelectedPostId(post._id)}
                    className="relative aspect-square bg-neutral-900 rounded-lg sm:rounded-xl overflow-hidden cursor-pointer group"
                  >
                    <img src={post.media?.[0]?.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <EditProfileModal
          user={profile}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdated={(updated) => setProfile((p) => ({ ...p, ...updated }))}
        />
      )}

      {/* Post Detail Modal */}
      {selectedPostId && (
        <PostDetailModal
          postId={selectedPostId}
          isOpen={!!selectedPostId}
          onClose={() => setSelectedPostId(null)}
          onPostDeleted={(id) => setPosts((prev) => prev.filter((p) => p._id !== id))}
        />
      )}

      {/* Story Viewer Modal */}
      {isStoryViewerOpen && storyGroup && (
        <StoryViewerModal
          storyGroup={storyGroup}
          isOpen={isStoryViewerOpen}
          onClose={() => {
            setIsStoryViewerOpen(false);
            if (profile?._id) fetchUserStories(profile._id);
          }}
        />
      )}
    </div>
  );
}
