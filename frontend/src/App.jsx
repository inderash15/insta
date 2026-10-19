import React, { useState } from 'react';
import { Instagram, Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import { SocketProvider } from './context/SocketContext';
import AppShell from './components/layout/AppShell';

function AppContent() {
  const { user, loading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'signup'

  // Loading spinner during startup session restoration (/api/auth/me)
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-2xl insta-story-gradient p-0.5 flex items-center justify-center shadow-xl shadow-pink-500/20 animate-pulse">
          <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center">
            <Instagram className="w-7 h-7 text-pink-500 animate-spin" />
          </div>
        </div>
        <p className="text-xs text-neutral-400 mt-4 tracking-wide font-medium">Loading Insta...</p>
      </div>
    );
  }

  // Authenticated State -> Render Full App Experience
  if (user) {
    return (
      <SocketProvider>
        <AppShell />
      </SocketProvider>
    );
  }


  // Unauthenticated State -> Render Login / Signup Experience
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between items-center px-4 py-8 sm:py-12">
      {/* Central Auth Container */}
      <div className="w-full flex-1 flex flex-col items-center justify-center">
        {authView === 'login' ? (
          <LoginPage onSwitchToSignup={() => setAuthView('signup')} />
        ) : (
          <SignupPage onSwitchToLogin={() => setAuthView('login')} />
        )}
      </div>

      {/* Footer mirroring Instagram layout */}
      <footer className="w-full max-w-4xl pt-8 pb-4 space-y-3 text-center">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-[11px] text-neutral-500">
          <span>Meta</span>
          <span>About</span>
          <span>Blog</span>
          <span>Jobs</span>
          <span>Help</span>
          <span>API</span>
          <span>Privacy</span>
          <span>Terms</span>
          <span>Locations</span>
          <span>Instagram Lite</span>
          <span>Threads</span>
          <span>Contact Uploading & Non-Users</span>
          <span>Meta Verified</span>
        </div>
        <div className="text-[11px] text-neutral-600">
          <span>English (US)</span> • <span>© 2026 Insta Platform</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
