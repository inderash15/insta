import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Instagram } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between items-center px-4 py-8 sm:py-12 selection:bg-pink-500/30">
      {/* Brand Header */}
      <header className="w-full max-w-sm mb-6 flex items-center justify-center">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl insta-story-gradient p-0.5 flex items-center justify-center shadow-lg shadow-pink-500/20 group-hover:scale-105 transition">
            <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center">
              <Instagram className="w-5 h-5 text-pink-500" />
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight insta-text-gradient">
            Insta
          </span>
        </Link>
      </header>

      {/* Main Outlet */}
      <main className="w-full flex-1 flex flex-col items-center justify-center max-w-md">
        <Outlet />
      </main>

      {/* Meta-style Clean Footer */}
      <footer className="w-full max-w-4xl pt-10 pb-4 space-y-3 text-center">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-[11px] text-neutral-500">
          <Link to="/legal" className="hover:text-neutral-300 transition">About</Link>
          <Link to="/help" className="hover:text-neutral-300 transition">Help</Link>
          <Link to="/help/contact" className="hover:text-neutral-300 transition">Contact</Link>
          <Link to="/legal" className="hover:text-neutral-300 transition">Privacy</Link>
          <Link to="/legal" className="hover:text-neutral-300 transition">Terms</Link>
          <Link to="/safety" className="hover:text-neutral-300 transition">Safety</Link>
          <Link to="/explore" className="hover:text-neutral-300 transition">Explore</Link>
          <Link to="/admin" className="hover:text-neutral-300 transition">Admin Portal</Link>
        </div>
        <div className="text-[11px] text-neutral-600">
          <span>English (US)</span> • <span>© 2026 Insta Platform Inc.</span>
        </div>
      </footer>
    </div>
  );
}
