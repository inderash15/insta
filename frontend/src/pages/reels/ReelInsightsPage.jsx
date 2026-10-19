import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  BarChart2, 
  Eye, 
  Heart, 
  MessageCircle, 
  Percent, 
  Clock, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ReelInsightsPage() {
  const { reelId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [reel, setReel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReel = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/reels/${reelId}`);
        if (res.data?.success) {
          const r = res.data.reel;
          const isOwner = user && (user._id === r.author?._id || user._id === r.author);
          if (!isOwner && user?.role !== 'admin') {
            setError('Only the creator can view insights for this reel.');
          } else {
            setReel(r);
          }
        } else {
          setError('Reel not found.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load insights');
      } finally {
        setLoading(false);
      }
    };

    if (reelId) {
      fetchReel();
    }
  }, [reelId, user]);

  if (loading) {
    return (
      <div className="w-full py-24 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
        <p className="text-xs text-neutral-500">Loading reel insights...</p>
      </div>
    );
  }

  if (error || !reel) {
    return (
      <div className="w-full max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 mx-auto flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-neutral-200">{error || 'Reel not found'}</p>
        <button
          onClick={() => navigate('/reels')}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
        >
          Back to Reels
        </button>
      </div>
    );
  }

  const views = reel.viewsCount || 0;
  const likes = reel.likesCount || 0;
  const comments = reel.commentsCount || 0;
  const engagementRate = views > 0 ? (((likes + comments) / views) * 100).toFixed(1) : '0.0';

  return (
    <div className="w-full max-w-2xl mx-auto py-6 px-4 space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-base font-bold text-neutral-100 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-purple-400" />
            <span>Reel Performance & Insights</span>
          </h1>
          <p className="text-xs text-neutral-400">Detailed metrics and audience reach</p>
        </div>
      </div>

      {/* Overview Card */}
      <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center gap-4">
        <div className="w-20 aspect-[9/16] bg-black rounded-xl overflow-hidden border border-neutral-700 shrink-0">
          <video src={reel.videoUrl} className="w-full h-full object-cover" muted />
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-xs font-semibold text-neutral-200 line-clamp-2">
            {reel.caption || 'No caption provided'}
          </p>
          <p className="text-[11px] text-neutral-400">
            Audio: {reel.audioTitle || 'Original Audio'}
          </p>
          <div className="flex items-center gap-2 text-[10px] text-neutral-500 pt-1">
            <Clock className="w-3 h-3" />
            <span>Published {new Date(reel.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-medium">Total Plays</span>
            <Eye className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-xl font-bold text-neutral-100">{views}</p>
        </div>

        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-medium">Reactions</span>
            <Heart className="w-4 h-4 text-pink-500" />
          </div>
          <p className="text-xl font-bold text-neutral-100">{likes}</p>
        </div>

        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-medium">Comments</span>
            <MessageCircle className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-xl font-bold text-neutral-100">{comments}</p>
        </div>

        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-medium">Engagement</span>
            <Percent className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-emerald-400">{engagementRate}%</p>
        </div>
      </div>

      {/* Conversion analysis */}
      <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3">
        <h2 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
          Audience Retention & Reach
        </h2>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs text-neutral-400 mb-1">
              <span>View to Like Conversion</span>
              <span>{views > 0 ? ((likes / views) * 100).toFixed(1) : '0'}%</span>
            </div>
            <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-full"
                style={{ width: `${Math.min(100, views > 0 ? (likes / views) * 100 : 0)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-neutral-400 mb-1">
              <span>Discussion Activity</span>
              <span>{views > 0 ? ((comments / views) * 100).toFixed(1) : '0'}%</span>
            </div>
            <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-sky-500 rounded-full"
                style={{ width: `${Math.min(100, views > 0 ? (comments / views) * 100 : 0)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
