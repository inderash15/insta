import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Instagram, Sparkles, Compass, Shield, Users } from 'lucide-react';

export default function LandingRouter() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-2xl insta-story-gradient p-0.5 flex items-center justify-center shadow-xl shadow-pink-500/20 animate-pulse">
          <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center">
            <Instagram className="w-7 h-7 text-pink-500 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  // If already authenticated, redirect straight to home feed
  if (user) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="w-full max-w-md space-y-6 text-center">
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-8 space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-3xl insta-story-gradient p-0.5 mx-auto flex items-center justify-center shadow-xl shadow-pink-500/20">
          <div className="w-full h-full bg-neutral-950 rounded-[22px] flex items-center justify-center">
            <Instagram className="w-8 h-8 text-pink-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Connect & Share
          </h1>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
            Experience next-generation photos, vertical reels, ephemeral stories, and real-time messaging with your friends.
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          <Link
            to="/auth/signup"
            className="w-full py-3 px-4 insta-story-gradient hover:opacity-95 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create New Account</span>
          </Link>

          <Link
            to="/auth/login"
            className="w-full py-3 px-4 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-200 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2"
          >
            <span>Log In with Existing Account</span>
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-neutral-800/80 text-[11px] text-neutral-400">
          <div className="p-2.5 rounded-xl bg-neutral-900/50 border border-neutral-800/60 flex flex-col items-center gap-1.5">
            <Compass className="w-4 h-4 text-pink-400" />
            <span>Explore</span>
          </div>
          <div className="p-2.5 rounded-xl bg-neutral-900/50 border border-neutral-800/60 flex flex-col items-center gap-1.5">
            <Users className="w-4 h-4 text-purple-400" />
            <span>Creators</span>
          </div>
          <div className="p-2.5 rounded-xl bg-neutral-900/50 border border-neutral-800/60 flex flex-col items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Private</span>
          </div>
        </div>
      </div>
    </div>
  );
}
