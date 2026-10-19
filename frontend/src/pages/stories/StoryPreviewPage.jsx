import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { X, Send, Heart, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function StoryPreviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const preview = location.state?.preview || 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=600';

  return (
    <div className="relative w-full h-screen max-w-sm mx-auto flex flex-col justify-between bg-black overflow-hidden shadow-2xl">
      {/* Top Progress bar and Header */}
      <div className="absolute top-0 inset-x-0 p-4 z-20 space-y-3 bg-gradient-to-b from-black/80 to-transparent">
        {/* Progress segment */}
        <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
          <div className="w-2/3 h-full bg-white rounded-full animate-pulse" />
        </div>

        {/* User bar */}
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/60 bg-neutral-800">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold">
                  {user?.username?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-bold">@{user?.username || 'you'}</p>
              <p className="text-[10px] text-white/70">Preview Mode</p>
            </div>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-full bg-black/40 text-white hover:bg-black/80 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Media Canvas */}
      <div className="w-full h-full">
        <img src={preview} alt="Story canvas" className="w-full h-full object-cover" />
      </div>

      {/* Bottom Action Footer */}
      <div className="absolute bottom-0 inset-x-0 p-4 z-20 bg-gradient-to-t from-black/90 to-transparent flex items-center gap-3">
        <Link
          to="/stories/create"
          className="flex-1 py-2.5 px-4 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur text-center transition"
        >
          Edit Media
        </Link>
        <Link
          to="/stories"
          className="py-2.5 px-4 rounded-xl insta-story-gradient text-white text-xs font-semibold shadow-lg shadow-pink-500/20 hover:opacity-95 transition"
        >
          Publish
        </Link>
      </div>
    </div>
  );
}
