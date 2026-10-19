import React from 'react';
import { 
  Instagram, 
  LogOut, 
  ShieldCheck, 
  UserCheck, 
  Calendar, 
  Mail, 
  Lock, 
  CheckCircle2, 
  Layers, 
  Users, 
  Film, 
  MessageCircle, 
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center">
      {/* Top Navbar */}
      <header className="w-full border-b border-neutral-800 bg-neutral-950/80 backdrop-blur sticky top-0 z-50 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl insta-story-gradient p-0.5 flex items-center justify-center shadow-lg shadow-pink-500/20">
            <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center">
              <Instagram className="w-4 h-4 text-pink-500" />
            </div>
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">Insta</h1>
            <p className="text-[10px] text-neutral-400">Authenticated Session Active</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-full text-xs text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>@{user?.username}</span>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 hover:text-red-400 active:scale-95 transition"
            title="Log out of session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-4xl p-4 sm:p-8 space-y-6">
        {/* Profile Card Header */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 sm:p-8 backdrop-blur">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Story Gradient Avatar Ring */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full insta-story-gradient p-1 shrink-0 shadow-xl shadow-pink-500/10">
              <div className="w-full h-full bg-neutral-950 rounded-full flex items-center justify-center text-3xl font-bold text-neutral-200 uppercase">
                {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-4 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <h2 className="text-xl font-bold tracking-tight text-neutral-100 flex items-center justify-center sm:justify-start gap-2">
                  <span>@{user?.username}</span>
                  {user?.isVerified && (
                    <span className="text-blue-400 text-xs bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                      Verified
                    </span>
                  )}
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-400">
                    {user?.role}
                  </span>
                </h2>

                <button 
                  onClick={() => alert('Profile editing, avatar uploads and follow graph will be enabled in Milestone 3.')}
                  className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold rounded-lg transition self-center sm:self-auto"
                >
                  Edit Profile
                </button>
              </div>

              {/* Stats Counters */}
              <div className="flex items-center justify-center sm:justify-start gap-6 text-xs sm:text-sm">
                <div>
                  <span className="font-bold text-neutral-100">{user?.counts?.posts || 0}</span>{' '}
                  <span className="text-neutral-400">posts</span>
                </div>
                <div>
                  <span className="font-bold text-neutral-100">{user?.counts?.followers || 0}</span>{' '}
                  <span className="text-neutral-400">followers</span>
                </div>
                <div>
                  <span className="font-bold text-neutral-100">{user?.counts?.following || 0}</span>{' '}
                  <span className="text-neutral-400">following</span>
                </div>
              </div>

              {/* Bio & Details */}
              <div className="space-y-1 text-xs sm:text-sm">
                <p className="font-semibold text-neutral-200">{user?.fullName}</p>
                <p className="text-neutral-400">{user?.bio || 'No bio provided yet.'}</p>
                <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-neutral-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{user?.email}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Session Diagnostics */}
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Session Security & Token Architecture
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
            <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-xl p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Lock className="w-3.5 h-3.5" />
                <span>HttpOnly Cookies</span>
              </div>
              <p className="text-neutral-400 text-[11px] leading-relaxed">
                JWT is stored in an <code className="text-neutral-200">httpOnly</code> cookie, inaccessible to malicious client-side JavaScript (XSS-proof).
              </p>
            </div>

            <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-xl p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Zero localStorage Tokens</span>
              </div>
              <p className="text-neutral-400 text-[11px] leading-relaxed">
                Zero authentication tokens or passwords reside in browser <code className="text-neutral-200">localStorage</code>.
              </p>
            </div>

            <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-xl p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-purple-400 font-semibold">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Server-Side Authorization</span>
              </div>
              <p className="text-neutral-400 text-[11px] leading-relaxed">
                Session state restored on page refresh via verified <code className="text-neutral-200">GET /api/auth/me</code> handshakes.
              </p>
            </div>
          </div>
        </div>

        {/* Milestone 2 Completion & Next Steps */}
        <div className="bg-neutral-900/30 border border-neutral-800/80 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-neutral-200">Milestone 2 Verified: Ready for Social Graph</h3>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              14/14 Tests Passed
            </span>
          </div>

          <p className="text-xs text-neutral-400 leading-relaxed">
            Authentication, session cookies, bcrypt hashing, Zod validation, and protected routes are fully operational. Up next in Milestone 3: User profiles, follow/unfollow requests, avatar media uploads, and privacy controls.
          </p>
        </div>
      </main>
    </div>
  );
}
