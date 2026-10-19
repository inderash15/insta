import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Send, 
  MoreHorizontal, 
  Share2, 
  BarChart2, 
  AlertTriangle,
  Loader2,
  Trash2,
  Edit,
  ArrowLeft
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import PageHeader from '../../components/common/PageHeader';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

export default function PostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadPostData() {
      try {
        setLoading(true);
        const [postRes, commentsRes] = await Promise.all([
          api.get(`/posts/${postId}`),
          api.get(`/posts/${postId}/comments`).catch(() => ({ data: { comments: [] } }))
        ]);

        if (postRes.data?.success) {
          const p = postRes.data.post;
          setPost(p);
          setIsLiked(Boolean(p.isLiked));
          setLikesCount(p.likesCount || 0);
          setIsBookmarked(Boolean(p.isBookmarked));
        }
        if (commentsRes.data?.success) {
          setComments(commentsRes.data.comments || []);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Post not found or unavailable');
      } finally {
        setLoading(false);
      }
    }
    loadPostData();
  }, [postId]);

  useEffect(() => {
    if (!socket || !postId) return;
    const currentUserId = (user?._id || user?.id)?.toString();

    const handlePostLiked = ({ postId: pId, likesCount: count, userId }) => {
      if (pId === postId) {
        setLikesCount(count);
        if (userId?.toString() === currentUserId) {
          setIsLiked(true);
        }
      }
    };

    const handlePostUnliked = ({ postId: pId, likesCount: count, userId }) => {
      if (pId === postId) {
        setLikesCount(count);
        if (userId?.toString() === currentUserId) {
          setIsLiked(false);
        }
      }
    };

    const handleCommentCreated = ({ postId: pId, comment }) => {
      if (pId === postId && comment) {
        setComments((prev) => {
          if (prev.some((c) => c._id === comment._id)) return prev;
          return [...prev, comment];
        });
      }
    };

    const handleCommentDeleted = ({ postId: pId, commentId }) => {
      if (pId === postId) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
      }
    };

    const handlePostSaved = ({ postId: pId, userId }) => {
      if (pId === postId && userId?.toString() === currentUserId) {
        setIsBookmarked(true);
      }
    };

    const handlePostUnsaved = ({ postId: pId, userId }) => {
      if (pId === postId && userId?.toString() === currentUserId) {
        setIsBookmarked(false);
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
  }, [socket, postId, user]);

  const handleToggleLike = async () => {
    const prevLiked = isLiked;
    const prevCount = likesCount;
    const nextLiked = !prevLiked;

    setIsLiked(nextLiked);
    setLikesCount(nextLiked ? prevCount + 1 : Math.max(0, prevCount - 1));

    try {
      const res = await api.post(`/posts/${postId}/like`);
      setIsLiked(res.data.liked);
      setLikesCount(res.data.likesCount);
    } catch (err) {
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
    }
  };

  const handleToggleBookmark = async () => {
    const prevSaved = isBookmarked;
    setIsBookmarked(!prevSaved);

    try {
      const res = await api.post(`/posts/${postId}/bookmark`);
      setIsBookmarked(res.data.bookmarked);
    } catch (err) {
      setIsBookmarked(prevSaved);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || commentSubmitting) return;

    try {
      setCommentSubmitting(true);
      const res = await api.post(`/posts/${postId}/comments`, { text: newComment.trim() });
      if (res.data?.success) {
        setComments((prev) => {
          if (prev.some((c) => c._id === res.data.comment._id)) return prev;
          return [...prev, res.data.comment];
        });
        setNewComment('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.delete(`/posts/${postId}`);
      navigate('/home');
    } catch (err) {
      alert('Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4">
        <LoadingSkeleton type="card" count={1} />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <p className="text-sm text-red-400 font-semibold">{error || 'Post not found'}</p>
        <Link to="/home" className="text-xs text-neutral-400 hover:text-white transition">
          ← Back to home feed
        </Link>
      </div>
    );
  }

  const isOwner = user?._id === post.author?._id || user?.username === post.author?.username;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6 text-neutral-100">
      <PageHeader
        title="Post"
        subtitle={`Published by @${post.author?.username}`}
        showBack
        actions={
          <div className="flex items-center gap-2">
            <Link
              to={`/posts/${postId}/shares`}
              className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white transition"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </Link>

            {isOwner && (
              <Link
                to={`/posts/${postId}/insights`}
                className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white transition"
                title="View Insights"
              >
                <BarChart2 className="w-4 h-4 text-pink-400" />
              </Link>
            )}

            <button
              onClick={() => setShowOptions(!showOptions)}
              className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white transition"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        }
      />

      {/* Options Menu Dropdown */}
      {showOptions && (
        <div className="p-2 rounded-2xl bg-neutral-900 border border-neutral-800 max-w-xs ml-auto shadow-2xl text-xs space-y-1">
          {isOwner && (
            <>
              <Link
                to={`/posts/${postId}/edit`}
                className="w-full p-2.5 rounded-xl hover:bg-neutral-800 flex items-center gap-2 text-neutral-200 transition"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Caption</span>
              </Link>
              <button
                onClick={handleDeletePost}
                className="w-full p-2.5 rounded-xl hover:bg-neutral-800 flex items-center gap-2 text-red-400 transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Post</span>
              </button>
            </>
          )}
          <Link
            to={`/posts/${postId}/report`}
            className="w-full p-2.5 rounded-xl hover:bg-neutral-800 flex items-center gap-2 text-amber-400 transition"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Report Post</span>
          </Link>
        </div>
      )}

      {/* Main Post Grid: Media on Left, Info & Comments on Right */}
      <div className="rounded-3xl border border-neutral-800 bg-neutral-950 overflow-hidden grid grid-cols-1 md:grid-cols-2 shadow-2xl">
        {/* Media */}
        <div className="aspect-square bg-neutral-900 flex items-center justify-center">
          <img
            src={post.media?.[0]?.url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800'}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>

        {/* Discussion Column */}
        <div className="flex flex-col justify-between p-4 sm:p-6 border-t md:border-t-0 md:border-l border-neutral-800">
          <div className="space-y-4 flex-1 overflow-y-auto max-h-96 pr-2">
            {/* Author bar */}
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-800">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-800 border border-neutral-700">
                {post.author?.avatarUrl ? (
                  <img src={post.author.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-neutral-400">
                    {post.author?.username?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <Link to={`/users/${post.author?.username}`} className="text-xs font-bold text-white hover:text-pink-400 transition">
                  @{post.author?.username}
                </Link>
                <p className="text-[10px] text-neutral-400">{new Date(post.createdAt).toLocaleString()}</p>
              </div>
            </div>

            {/* Caption */}
            {post.caption && (
              <div className="text-xs text-neutral-200 leading-relaxed">
                <span className="font-bold mr-2 text-white">@{post.author?.username}</span>
                <span>{post.caption}</span>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-3 pt-2">
              <h4 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Comments ({comments.length})</h4>
              {comments.length === 0 ? (
                <p className="text-xs text-neutral-500 italic">No comments yet. Start the conversation!</p>
              ) : (
                comments.map((c) => (
                  <div key={c._id} className="text-xs space-y-0.5">
                    <p className="text-neutral-200">
                      <span className="font-bold mr-2 text-white">@{c.author?.username || 'user'}</span>
                      <span>{c.content}</span>
                    </p>
                    <p className="text-[10px] text-neutral-500">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action Bar & Input */}
          <div className="pt-4 border-t border-neutral-800 space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={handleToggleLike} className="hover:scale-110 transition">
                  <Heart className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : 'text-neutral-300'}`} />
                </button>
                <Link to={`/posts/${postId}/comments`} className="hover:scale-110 transition">
                  <MessageCircle className="w-6 h-6 text-neutral-300" />
                </Link>
                <Link to={`/posts/${postId}/shares`} className="hover:scale-110 transition">
                  <Send className="w-6 h-6 text-neutral-300" />
                </Link>
              </div>

              <div className="flex items-center gap-3">
                <Link to={`/posts/${postId}/save`} className="text-xs text-neutral-400 hover:text-white">
                  Add to Collection
                </Link>
                <button onClick={handleToggleBookmark} className="hover:scale-110 transition">
                  <Bookmark className={`w-6 h-6 ${isBookmarked ? 'fill-white text-white' : 'text-neutral-300'}`} />
                </button>
              </div>
            </div>

            <Link to={`/posts/${postId}/likers`} className="text-xs font-bold text-white block hover:underline">
              {likesCount} {likesCount === 1 ? 'like' : 'likes'}
            </Link>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 py-2 px-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500"
              />
              <button
                type="submit"
                disabled={commentSubmitting || !newComment.trim()}
                className="px-3.5 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 disabled:opacity-40 text-xs font-semibold text-white transition"
              >
                Post
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
