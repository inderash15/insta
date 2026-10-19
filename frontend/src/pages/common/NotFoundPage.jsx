import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-6 text-center selection:bg-pink-500/30">
      <div className="w-16 h-16 rounded-3xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-pink-500 mb-6 shadow-xl shadow-pink-500/10">
        <Compass className="w-8 h-8 stroke-[1.8] animate-spin-slow" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Sorry, this page isn't available.</h1>
      <p className="text-sm text-neutral-400 max-w-md mb-8 leading-relaxed">
        The link you followed may be broken, or the page may have been removed. Check the URL or return to your feed.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/home"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl insta-story-gradient text-white text-xs font-semibold shadow-lg shadow-pink-500/20 hover:opacity-95 transition"
        >
          <Home className="w-4 h-4" />
          <span>Back to Feed</span>
        </Link>

        <Link
          to="/explore"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-800 transition"
        >
          <Compass className="w-4 h-4" />
          <span>Explore Platform</span>
        </Link>
      </div>
    </div>
  );
}
