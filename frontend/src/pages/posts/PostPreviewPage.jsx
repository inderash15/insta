import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/common/PageHeader';
import { Heart, MessageCircle, Send, Bookmark, ArrowLeft } from 'lucide-react';

export default function PostPreviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const previewData = location.state || {};
  const mediaUrl = previewData.preview || '';
  const caption = previewData.caption || '';
  const tags = previewData.hashtags ? previewData.hashtags.split(',').map((t) => t.trim()).filter(Boolean) : [];

  return (
    <div className="max-w-md mx-auto py-6 px-4 space-y-6 text-neutral-100">
      <PageHeader
        title="Post Pre-Flight Preview"
        subtitle="This is how your post will render in your followers' home feeds."
        showBack
      />

      <div className="rounded-3xl border border-neutral-800 bg-neutral-950 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-neutral-700 bg-neutral-800">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-neutral-400">
                  {user?.username?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-white">@{user?.username || 'you'}</p>
              <p className="text-[10px] text-neutral-400">Just now</p>
            </div>
          </div>
        </div>

        {/* Media */}
        <div className="w-full aspect-square bg-neutral-900">
          <img src={mediaUrl} alt="" className="w-full h-full object-cover" />
        </div>

        {/* Interaction bar */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between text-neutral-300">
            <div className="flex items-center gap-4">
              <Heart className="w-6 h-6 hover:text-red-500 transition cursor-pointer" />
              <MessageCircle className="w-6 h-6 hover:text-white transition cursor-pointer" />
              <Send className="w-6 h-6 hover:text-white transition cursor-pointer" />
            </div>
            <Bookmark className="w-6 h-6 hover:text-white transition cursor-pointer" />
          </div>

          <p className="text-xs font-bold text-white">0 likes</p>

          <p className="text-xs text-neutral-200">
            <span className="font-bold mr-1">@{user?.username}</span>
            <span>{caption}</span>
          </p>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {tags.map((tag, idx) => (
              <span key={idx} className="text-[11px] text-pink-400 font-medium">#{tag}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex-1 py-3 px-4 rounded-2xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-xs font-semibold text-white transition"
        >
          Back to Editing
        </button>

        <Link
          to="/create/post"
          className="flex-1 py-3 px-4 rounded-2xl insta-story-gradient text-white text-xs font-semibold text-center hover:opacity-95 transition shadow-lg shadow-pink-500/20"
        >
          Confirm & Share
        </Link>
      </div>
    </div>
  );
}
