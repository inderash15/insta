import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, UserPlus, Check, ArrowRight, Camera, Compass } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

export default function WelcomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [followedIds, setFollowedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSuggestions() {
      try {
        const res = await axios.get('/api/explore/people', { withCredentials: true });
        if (res.data.success) {
          setSuggestedUsers(res.data.users.slice(0, 4));
        }
      } catch (err) {
        // Fallback demo suggestions if new db
        setSuggestedUsers([
          { _id: '1', username: 'alex', fullName: 'Alex Rivera', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
          { _id: '2', username: 'maya', fullName: 'Maya Lin', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150' },
          { _id: '3', username: 'admin', fullName: 'Insta Official', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' }
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchSuggestions();
  }, []);

  const handleToggleFollow = async (targetId) => {
    try {
      if (followedIds.has(targetId)) {
        await axios.post(`/api/users/${targetId}/unfollow`, {}, { withCredentials: true });
        setFollowedIds((prev) => {
          const next = new Set(prev);
          next.delete(targetId);
          return next;
        });
      } else {
        await axios.post(`/api/users/${targetId}/follow`, {}, { withCredentials: true });
        setFollowedIds((prev) => new Set(prev).add(targetId));
      }
    } catch (err) {
      console.error('Follow failed', err);
    }
  };

  return (
    <div className="w-full max-w-lg space-y-6 text-neutral-100">
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl insta-story-gradient p-0.5 mx-auto flex items-center justify-center shadow-lg shadow-pink-500/20">
            <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-pink-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome to Insta, {user?.fullName || 'Creator'}!
          </h1>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
            Your account @{user?.username} is ready. Follow a few creators to start filling your home feed.
          </p>
        </div>

        {/* Suggested Creators */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Suggested for you</h2>
          <div className="divide-y divide-neutral-800/80 rounded-2xl border border-neutral-800 bg-neutral-900/40 overflow-hidden">
            {suggestedUsers.map((su) => {
              const isFollowing = followedIds.has(su._id);
              return (
                <div key={su._id} className="p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-neutral-700 bg-neutral-800 shrink-0">
                      {su.avatarUrl ? (
                        <img src={su.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-neutral-400">
                          {su.username[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{su.fullName}</p>
                      <p className="text-[11px] text-neutral-500 truncate">@{su.username}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleFollow(su._id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                      isFollowing
                        ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                    }`}
                  >
                    {isFollowing ? (
                      <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Following</span>
                    ) : (
                      <span className="flex items-center gap-1"><UserPlus className="w-3.5 h-3.5" /> Follow</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <Link
            to="/profile/edit"
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-800 transition flex items-center justify-center gap-2"
          >
            <Camera className="w-4 h-4 text-pink-400" />
            <span>Customize Profile</span>
          </Link>

          <button
            onClick={() => navigate('/home')}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl insta-story-gradient text-white text-xs font-semibold hover:opacity-95 transition flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20"
          >
            <span>Go to Feed</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
