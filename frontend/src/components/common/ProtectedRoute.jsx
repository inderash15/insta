import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Instagram } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-2xl insta-story-gradient p-0.5 flex items-center justify-center shadow-xl shadow-pink-500/20 animate-pulse">
          <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center">
            <Instagram className="w-7 h-7 text-pink-500 animate-spin" />
          </div>
        </div>
        <p className="text-xs text-neutral-400 mt-4 tracking-wide font-medium">Verifying session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/auth/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return children;
}
