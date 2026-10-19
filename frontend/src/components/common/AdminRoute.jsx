import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <p className="text-xs text-neutral-400">Verifying authorization...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (user.role !== 'admin' && user.role !== 'moderator') {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 text-red-500 shadow-xl">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold mb-2">403 — Unauthorized Access</h1>
        <p className="text-sm text-neutral-400 max-w-md mb-6 leading-relaxed">
          The requested administration console requires elevated moderator or administrator privileges. Your current role is <span className="font-mono text-pink-400">@{user.role}</span>.
        </p>
        <Link
          to="/home"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-200 hover:text-white hover:bg-neutral-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Feed</span>
        </Link>
      </div>
    );
  }

  return children;
}
