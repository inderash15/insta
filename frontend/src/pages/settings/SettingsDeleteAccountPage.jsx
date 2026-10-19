import React, { useState } from 'react';
import { Trash2, AlertTriangle, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SettingsLayoutWrapper from '../../components/settings/SettingsLayoutWrapper';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function SettingsDeleteAccountPage() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async (e) => {
    e.preventDefault();
    if (confirmText !== user?.username) {
      setError(`Please type your exact username "${user?.username}" to confirm.`);
      return;
    }

    if (!password) {
      setError('Password is required to permanently delete your account.');
      return;
    }

    setDeleting(true);
    setError('');

    try {
      const res = await api.post('/settings/delete-account', { password });
      if (res.data?.success) {
        logout();
        navigate('/welcome');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account. Please verify your password.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SettingsLayoutWrapper
      title="Delete Account"
      subtitle="Permanently erase your account, publications, direct messages, and profile"
    >
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs font-bold text-red-400">Warning: This action is permanent and irreversible</p>
          <p className="text-[11px] text-neutral-300">
            Deleting your account will remove all your posts, reels, stories, comments, likes, and followers. Once confirmed, you will not be able to retrieve your data.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleDelete} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
            Type your username &ldquo;<span className="text-pink-400">{user?.username}</span>&rdquo; to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={user?.username}
            required
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Enter your password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={deleting || confirmText !== user?.username || !password}
          className="w-full py-2.5 rounded-xl font-semibold text-xs text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-40"
        >
          {deleting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Deleting Account Forever...</span>
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4" />
              <span>Permanently Delete My Account</span>
            </>
          )}
        </button>
      </form>
    </SettingsLayoutWrapper>
  );
}
