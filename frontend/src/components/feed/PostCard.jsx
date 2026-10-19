import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Share2, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight,
  Flag,
  Trash2,
  Copy,
  Check
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

export default function PostCard({ post: initialPost, onOpenComments, onPostDeleted }) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [post, setPost] = useState(initialPost);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    setPost(initialPost);
  }, [initialPost]);

  useEffect(() => {
    if (!socket || !post?._id) return;
    const currentUserId = (user?._id || user?.id)?.toString();

    const handlePostLiked = ({ postId, likesCount, userId }) => {
      if (postId === post._id) {
        setPost((curr) => ({
          ...curr,
          likesCount,
          ...(userId?.toString() === currentUserId ? { isLiked: true } : {})
        }));
      }
    };

    const handlePostUnliked = ({ postId, likesCount, userId }) => {
      if (postId === post._id) {
        setPost((curr) => ({
          ...curr,
          likesCount,
          ...(userId?.toString() === currentUserId ? { isLiked: false } : {})
        }));
      }
    };

    const handleCommentCreated = ({ postId, commentsCount }) => {
      if (postId === post._id) {
        setPost((curr) => ({
          ...curr,
          commentsCount: commentsCount !== undefined ? commentsCount : (curr.commentsCount || 0) + 1
        }));
      }
    };

    const handleCommentDeleted = ({ postId, commentsCount }) => {
      if (postId === post._id) {
        setPost((curr) => ({
          ...curr,
          commentsCount: commentsCount !== undefined ? commentsCount : Math.max(0, (curr.commentsCount || 1) - 1)
        }));
      }
    };

    const handlePostSaved = ({ postId, userId }) => {
      if (postId === post._id && userId?.toString() === currentUserId) {
        setPost((curr) => ({ ...curr, isBookmarked: true }));
      }
    };

    const handlePostUnsaved = ({ postId, userId }) => {
      if (postId === post._id && userId?.toString() === currentUserId) {
        setPost((curr) => ({ ...curr, isBookmarked: false }));
      }
    };

    const handlePostDeletedSocket = ({ postId }) => {
      if (postId === post._id && onPostDeleted) {
        onPostDeleted(postId);
      }
    };

    socket.on('post:liked', handlePostLiked);
    socket.on('post:unliked', handlePostUnliked);
    socket.on('comment:created', handleCommentCreated);
    socket.on('comment:deleted', handleCommentDeleted);
    socket.on('post:saved', handlePostSaved);
    socket.on('post:unsaved', handlePostUnsaved);
    socket.on('post:deleted', handlePostDeletedSocket);

    return () => {
      socket.off('post:liked', handlePostLiked);
      socket.off('post:unliked', handlePostUnliked);
      socket.off('comment:created', handleCommentCreated);
      socket.off('comment:deleted', handleCommentDeleted);
      socket.off('post:saved', handlePostSaved);
      socket.off('post:unsaved', handlePostUnsaved);
      socket.off('post:deleted', handlePostDeletedSocket);
    };
  }, [socket, post?._id, user, onPostDeleted]);

  const isLikingRef = React.useRef(false);
  const handleToggleLike = async () => {
    if (isLikingRef.current) return;
    isLikingRef.current = true;
    const prevLiked = post.isLiked;
    const prevCount = post.likesCount;

    setPost({
      ...post,
      isLiked: !prevLiked,
      likesCount: prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1
    });

    try {
      const res = await api.post(`/posts/${post._id}/like`);
      setPost((curr) => ({
        ...curr,
        isLiked: res.data.liked,
        likesCount: res.data.likesCount
      }));
    } catch {
      setPost((curr) => ({
        ...curr,
        isLiked: prevLiked,
        likesCount: prevCount
      }));
    } finally {
      isLikingRef.current = false;
    }
  };

  const handleDoubleTap = () => {
    setShowHeartBurst(true);
    setTimeout(() => setShowHeartBurst(false), 700);
    if (!post.isLiked) {
      handleToggleLike();
    }
  };

  const isBookmarkingRef = React.useRef(false);
  const handleToggleBookmark = async () => {
    if (isBookmarkingRef.current) return;
    isBookmarkingRef.current = true;
    const prevBookmarked = post.isBookmarked;
    setPost({ ...post, isBookmarked: !prevBookmarked });

    try {
      const res = await api.post(`/posts/${post._id}/bookmark`);
      setPost((curr) => ({ ...curr, isBookmarked: res.data.bookmarked }));
    } catch {
      setPost((curr) => ({ ...curr, isBookmarked: prevBookmarked }));
    } finally {
      isBookmarkingRef.current = false;
    }
  };

  const handleAddInlineComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || submittingComment) return;

    setSubmittingComment(true);
    try {
      await api.post(`/posts/${post._id}/comments`, { text: commentText.trim() });
      setPost((curr) => ({ ...curr, commentsCount: (curr.commentsCount || 0) + 1 }));
      setCommentText('');
    } catch (err) {
      alert(err.message || 'Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReport = async () => {
    const reason = prompt('Reason for report (spam, inappropriate, harassment, violence, other):', 'spam');
    if (!reason) return;
    try {
      await api.post('/reports', {
        targetType: 'post',
        targetId: post._id,
        reason: reason.toLowerCase().trim()
      });
      alert('Report submitted. Thank you for keeping our community safe.');
      setShowMenu(false);
    } catch (err) {
      alert(err.message || 'Failed to submit report');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/posts/${post._id}`);
      if (onPostDeleted) onPostDeleted(post._id);
    } catch (err) {
      alert(err.message || 'Failed to delete post');
    }
  };

  return (
    <article className="bg-neutral-900/60 border border-neutral-800 rounded-2xl overflow-hidden backdrop-blur mb-6">
      {/* Post Header */}
      <div className="flex items-center justify-between p-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full insta-story-gradient p-0.5">
            <div className="w-full h-full bg-neutral-950 rounded-full flex items-center justify-center font-bold text-xs uppercase overflow-hidden">
              {post.author?.avatarUrl ? (
                <img src={post.author.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                post.author?.username?.charAt(0) || 'U'
              )}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-neutral-100 flex items-center gap-1">
              <span>{post.author?.username}</span>
              {post.author?.isVerified && <span className="text-blue-400 text-[10px]">✓</span>}
            </p>
            <p className="text-[10px] text-neutral-500">
              {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* 3-dots Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-8 w-44 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl py-1 z-40 text-xs">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin + `/p/${post._id}`);
                  alert('Link copied!');
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-neutral-300 hover:bg-neutral-800 flex items-center gap-2"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Link</span>
              </button>

              <button
                onClick={handleReport}
                className="w-full px-3 py-2 text-left text-amber-400 hover:bg-neutral-800 flex items-center gap-2"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Report Post</span>
              </button>

              {(user?._id === post.author?._id || user?.id === post.author?._id || user?.role === 'admin') && (
                <button
                  onClick={handleDelete}
                  className="w-full px-3 py-2 text-left text-red-400 hover:bg-neutral-800 flex items-center gap-2 border-t border-neutral-800"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Post</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Media */}
      <div 
        onDoubleClick={handleDoubleTap}
        className="relative bg-black flex items-center justify-center select-none overflow-hidden max-h-[550px]"
      >
        {post.media?.[activeMediaIndex]?.type === 'video' ? (
          <video 
            src={post.media[activeMediaIndex].url} 
            controls 
            className="w-full max-h-[550px] object-cover" 
          />
        ) : (
          <img 
            src={post.media?.[activeMediaIndex]?.url} 
            alt="Post" 
            className="w-full max-h-[550px] object-cover" 
          />
        )}

        {/* Double-tap heart animation */}
        {showHeartBurst && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <Heart className="w-24 h-24 text-red-500 fill-red-500 drop-shadow-lg animate-heart-burst" />
          </div>
        )}

        {/* Carousel pagination arrows */}
        {post.media?.length > 1 && (
          <>
            {activeMediaIndex > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); setActiveMediaIndex((i) => i - 1); }}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            {activeMediaIndex < post.media.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); setActiveMediaIndex((i) => i + 1); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
              {post.media.map((_, i) => (
                <span
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition ${
                    i === activeMediaIndex ? 'bg-pink-500 w-3' : 'bg-white/60'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Action Row */}
      <div className="p-3.5 space-y-2.5">
        <div className="flex items-center justify-between text-neutral-200">
          <div className="flex items-center gap-4">
            <button
              onClick={handleToggleLike}
              className="hover:scale-110 active:scale-90 transition"
            >
              <Heart 
                className={`w-6 h-6 ${
                  post.isLiked ? 'text-red-500 fill-red-500' : 'text-neutral-200 hover:text-neutral-400'
                }`} 
              />
            </button>

            <button
              onClick={() => onOpenComments(post._id)}
              className="hover:scale-110 active:scale-90 transition"
            >
              <MessageCircle className="w-6 h-6 text-neutral-200 hover:text-neutral-400" />
            </button>

            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.origin + `/p/${post._id}`);
                alert('Link copied!');
              }}
              className="hover:scale-110 active:scale-90 transition"
            >
              <Share2 className="w-5 h-5 text-neutral-200 hover:text-neutral-400" />
            </button>
          </div>

          <button
            onClick={handleToggleBookmark}
            className="hover:scale-110 active:scale-90 transition"
          >
            <Bookmark 
              className={`w-6 h-6 ${
                post.isBookmarked ? 'text-neutral-100 fill-neutral-100' : 'text-neutral-200 hover:text-neutral-400'
              }`} 
            />
          </button>
        </div>

        {/* Likes Count */}
        <p className="text-xs font-bold text-neutral-100">
          {post.likesCount || 0} {post.likesCount === 1 ? 'like' : 'likes'}
        </p>

        {/* Caption */}
        {post.caption && (
          <p className="text-xs text-neutral-200 leading-relaxed">
            <span className="font-bold text-neutral-100 mr-1.5">{post.author?.username}</span>
            {post.caption.split(' ').map((word, i) => {
              if (word.startsWith('#') || word.startsWith('@')) {
                return <span key={i} className="text-blue-400 font-medium mr-1">{word} </span>;
              }
              return word + ' ';
            })}
          </p>
        )}

        {/* Comments count link */}
        {(post.commentsCount || 0) > 0 && (
          <button
            onClick={() => onOpenComments(post._id)}
            className="text-xs text-neutral-400 hover:text-neutral-300 transition"
          >
            View all {post.commentsCount} comments
          </button>
        )}

        {/* Inline comment input */}
        <form onSubmit={handleAddInlineComment} className="flex items-center gap-2 pt-2 border-t border-neutral-800/80">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            maxLength={300}
            className="flex-1 bg-transparent text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!commentText.trim() || submittingComment}
            className="text-xs font-bold text-pink-500 hover:text-pink-400 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            Post
          </button>
        </form>
      </div>
    </article>
  );
}
