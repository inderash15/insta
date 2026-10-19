import React, { useState, useEffect } from 'react';
import { 
  X, 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Share2, 
  Send, 
  Trash2, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight,
  Loader2 
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

export default function PostDetailModal({ postId, isOpen, onClose, onPostDeleted }) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [showHeartBurst, setShowHeartBurst] = useState(false);

  useEffect(() => {
    if (!socket || !postId || !isOpen) return;
    const currentUserId = (user?._id || user?.id)?.toString();

    const handlePostLiked = ({ postId: pId, likesCount, userId }) => {
      if (pId === postId) {
        setPost((curr) => curr ? {
          ...curr,
          likesCount,
          ...(userId?.toString() === currentUserId ? { isLiked: true } : {})
        } : null);
      }
    };

    const handlePostUnliked = ({ postId: pId, likesCount, userId }) => {
      if (pId === postId) {
        setPost((curr) => curr ? {
          ...curr,
          likesCount,
          ...(userId?.toString() === currentUserId ? { isLiked: false } : {})
        } : null);
      }
    };

    const handleCommentCreated = ({ postId: pId, comment, commentsCount }) => {
      if (pId === postId && comment) {
        setComments((prev) => {
          if (prev.some((c) => c._id === comment._id)) return prev;
          return [...prev, comment];
        });
        setPost((curr) => curr ? {
          ...curr,
          commentsCount: commentsCount !== undefined ? commentsCount : (curr.commentsCount || 0) + 1
        } : null);
      }
    };

    const handleCommentDeleted = ({ postId: pId, commentId, commentsCount }) => {
      if (pId === postId) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
        setPost((curr) => curr ? {
          ...curr,
          commentsCount: commentsCount !== undefined ? commentsCount : Math.max(0, (curr.commentsCount || 1) - 1)
        } : null);
      }
    };

    const handlePostSaved = ({ postId: pId, userId }) => {
      if (pId === postId && userId?.toString() === currentUserId) {
        setPost((curr) => curr ? { ...curr, isBookmarked: true } : null);
      }
    };

    const handlePostUnsaved = ({ postId: pId, userId }) => {
      if (pId === postId && userId?.toString() === currentUserId) {
        setPost((curr) => curr ? { ...curr, isBookmarked: false } : null);
      }
    };

    socket.on('post:liked', handlePostLiked);
    socket.on('post:unliked', handlePostUnliked);
    socket.on('comment:created', handleCommentCreated);
    socket.on('comment:deleted', handleCommentDeleted);
    socket.on('post:saved', handlePostSaved);
    socket.on('post:unsaved', handlePostUnsaved);

    return () => {
      socket.off('post:liked', handlePostLiked);
      socket.off('post:unliked', handlePostUnliked);
      socket.off('comment:created', handleCommentCreated);
      socket.off('comment:deleted', handleCommentDeleted);
      socket.off('post:saved', handlePostSaved);
      socket.off('post:unsaved', handlePostUnsaved);
    };
  }, [socket, postId, isOpen, user]);

  useEffect(() => {
    if (!postId || !isOpen) return;

    const fetchPostAndComments = async () => {
      setLoading(true);
      try {
        const [postRes, commentRes] = await Promise.all([
          api.get(`/posts/${postId}`),
          api.get(`/posts/${postId}/comments`)
        ]);
        setPost(postRes.data.post);
        setComments(commentRes.data.comments || []);
      } catch (err) {
        console.error('Failed to load post:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPostAndComments();
  }, [postId, isOpen]);

  if (!isOpen) return null;

  const handleToggleLike = async () => {
    if (!post) return;
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
    }
  };

  const handleDoubleTap = () => {
    setShowHeartBurst(true);
    setTimeout(() => setShowHeartBurst(false), 700);
    if (!post?.isLiked) {
      handleToggleLike();
    }
  };

  const handleToggleBookmark = async () => {
    if (!post) return;
    const prevBookmarked = post.isBookmarked;
    setPost({ ...post, isBookmarked: !prevBookmarked });

    try {
      const res = await api.post(`/posts/${post._id}/bookmark`);
      setPost((curr) => ({ ...curr, isBookmarked: res.data.bookmarked }));
    } catch {
      setPost((curr) => ({ ...curr, isBookmarked: prevBookmarked }));
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submittingComment) return;

    setSubmittingComment(true);
    try {
      const res = await api.post(`/posts/${post._id}/comments`, { text: newComment.trim() });
      setComments((prev) => [...prev, res.data.comment]);
      setPost((curr) => ({ ...curr, commentsCount: (curr.commentsCount || 0) + 1 }));
      setNewComment('');
    } catch (err) {
      alert(err.message || 'Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/posts/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      setPost((curr) => ({ ...curr, commentsCount: Math.max(0, (curr.commentsCount || 0) - 1) }));
    } catch (err) {
      alert(err.message || 'Failed to delete comment');
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.delete(`/posts/${post._id}`);
      if (onPostDeleted) onPostDeleted(post._id);
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to delete post');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/85 backdrop-blur-sm animate-fadeIn">
      {/* Close button */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-neutral-900/80 text-white hover:bg-neutral-800 transition"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Main card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row">
        {loading || !post ? (
          <div className="w-full h-96 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
          </div>
        ) : (
          <>
            {/* Left: Media Area */}
            <div 
              onDoubleClick={handleDoubleTap}
              className="relative w-full md:w-[55%] bg-black flex items-center justify-center select-none overflow-hidden min-h-[300px] md:min-h-[500px]"
            >
              {post.media?.[activeMediaIndex]?.type === 'video' ? (
                <video 
                  src={post.media[activeMediaIndex].url} 
                  controls 
                  className="max-h-[500px] w-full object-contain"
                />
              ) : (
                <img 
                  src={post.media?.[activeMediaIndex]?.url} 
                  alt="Post" 
                  className="max-h-[500px] w-full object-contain"
                />
              )}

              {/* Double tap heart animation */}
              {showHeartBurst && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                  <Heart className="w-24 h-24 text-red-500 fill-red-500 drop-shadow-lg animate-heart-burst" />
                </div>
              )}

              {/* Media carousel arrows */}
              {post.media?.length > 1 && (
                <>
                  {activeMediaIndex > 0 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setActiveMediaIndex((i) => i - 1); }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/90 transition"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  )}
                  {activeMediaIndex < post.media.length - 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setActiveMediaIndex((i) => i + 1); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/90 transition"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                  <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
                    {post.media.map((_, i) => (
                      <span
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full transition ${
                          i === activeMediaIndex ? 'bg-pink-500 w-3' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Right: Comments & Actions */}
            <div className="w-full md:w-[45%] flex flex-col justify-between border-t md:border-t-0 md:border-l border-neutral-800 bg-neutral-900/90">
              {/* Header */}
              <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
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
                    <p className="text-[10px] text-neutral-400">{post.author?.fullName}</p>
                  </div>
                </div>

                {(user?._id === post.author?._id || user?.id === post.author?._id || user?.role === 'admin') && (
                  <button 
                    onClick={handleDeletePost}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-neutral-800 transition"
                    title="Delete Post"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Scrollable comments & caption */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[300px] md:max-h-[360px]">
                {/* Author Caption */}
                {post.caption && (
                  <div className="flex items-start gap-3 pb-3 border-b border-neutral-800/60">
                    <div className="w-7 h-7 rounded-full bg-neutral-800 shrink-0 flex items-center justify-center text-xs font-bold uppercase overflow-hidden">
                      {post.author?.avatarUrl ? (
                        <img src={post.author.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        post.author?.username?.charAt(0) || 'U'
                      )}
                    </div>
                    <div className="text-xs space-y-1">
                      <p className="text-neutral-200">
                        <span className="font-bold text-neutral-100 mr-1.5">{post.author?.username}</span>
                        {post.caption}
                      </p>
                      <p className="text-[10px] text-neutral-500">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {/* Comments List */}
                {comments.length === 0 ? (
                  <div className="text-center py-6 text-neutral-500 text-xs">
                    No comments yet. Start the conversation!
                  </div>
                ) : (
                  comments.map((c) => (
                    <div key={c._id} className="flex items-start justify-between gap-2 group">
                      <div className="flex items-start gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-neutral-800 shrink-0 flex items-center justify-center text-[10px] font-bold uppercase overflow-hidden">
                          {c.author?.avatarUrl ? (
                            <img src={c.author.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            c.author?.username?.charAt(0) || 'U'
                          )}
                        </div>
                        <div className="text-xs">
                          <p className="text-neutral-200">
                            <span className="font-bold text-neutral-100 mr-1.5">{c.author?.username}</span>
                            {c.text}
                          </p>
                          <span className="text-[10px] text-neutral-500">
                            {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      {(user?._id === c.author?._id || user?.id === c.author?._id || user?._id === post.author?._id) && (
                        <button
                          onClick={() => handleDeleteComment(c._id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-neutral-500 hover:text-red-400 transition"
                          title="Delete comment"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Bottom Actions & Input */}
              <div className="border-t border-neutral-800 p-4 space-y-3 bg-neutral-950/40">
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
                    <button className="hover:scale-110 active:scale-90 transition">
                      <MessageCircle className="w-6 h-6 text-neutral-200 hover:text-neutral-400" />
                    </button>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.origin + `/p/${post._id}`);
                        alert('Post link copied to clipboard!');
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

                <div className="text-xs font-semibold text-neutral-100">
                  {post.likesCount || 0} {post.likesCount === 1 ? 'like' : 'likes'}
                </div>

                {/* Inline comment form */}
                <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-1 border-t border-neutral-800">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    maxLength={500}
                    className="flex-1 bg-transparent text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim() || submittingComment}
                    className="text-xs font-bold text-pink-500 hover:text-pink-400 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    Post
                  </button>
                </form>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

