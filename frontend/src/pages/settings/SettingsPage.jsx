import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Trash2, 
  Users, 
  FileText, 
  Check, 
  AlertTriangle, 
  Loader2, 
  BarChart3, 
  ShieldAlert,
  Ban,
  UserCheck 
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('account'); // 'account' | 'admin'

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [savingPassword, setSavingPassword] = useState(false);

  // Admin state
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminSearch, setAdminSearch] = useState('');
  const [loadingAdmin, setLoadingAdmin] = useState(false);

  const isAdminOrMod = user?.role === 'admin' || user?.role === 'moderator';

  // Handle password change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    setSavingPassword(true);
    setPasswordMsg(null);
    setPasswordError(null);

    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      setPasswordMsg('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    const password = prompt('Enter your password to permanently delete your account:');
    if (!password) return;

    try {
      await api.delete('/auth/account', { data: { password } });
      alert('Your account has been deleted.');
      logout();
    } catch (err) {
      alert(err.message || 'Failed to delete account');
    }
  };

  // Fetch admin dashboard data
  const fetchAdminData = async () => {
    if (!isAdminOrMod) return;
    setLoadingAdmin(true);
    try {
      const [statsRes, reportsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/reports?status=pending'),
        api.get('/admin/users?limit=20')
      ]);
      setStats(statsRes.data?.stats);
      setReports(reportsRes.data?.reports || []);
      setAdminUsers(usersRes.data?.users || []);
    } catch (err) {
      console.error('Failed to load admin data:', err.message);
    } finally {
      setLoadingAdmin(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'admin') {
      fetchAdminData();
    }
  }, [activeTab]);

  // Handle report resolution
  const handleResolveReport = async (reportId, action) => {
    try {
      await api.patch(`/admin/reports/${reportId}`, {
        status: 'resolved',
        action,
        resolutionNotes: `Action ${action} taken by ${user?.username}`
      });
      setReports((prev) => prev.filter((r) => r._id !== reportId));
      fetchAdminData();
      alert('Report resolved.');
    } catch (err) {
      alert(err.message || 'Failed to resolve report');
    }
  };

  // Handle user ban toggle
  const handleToggleBan = async (targetUser) => {
    try {
      const newBannedState = !targetUser.isBanned;
      await api.patch(`/admin/users/${targetUser._id}`, { isBanned: newBannedState });
      setAdminUsers((prev) =>
        prev.map((u) => (u._id === targetUser._id ? { ...u, isBanned: newBannedState } : u))
      );
    } catch (err) {
      alert(err.message || 'Failed to update user status');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="border-b border-neutral-800 pb-4">
        <h1 className="text-xl font-bold text-neutral-100">Settings & Moderation</h1>
        <p className="text-xs text-neutral-400">Manage security, credentials, and platform governance.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-800 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('account')}
          className={`py-3 px-6 flex items-center gap-2 transition ${
            activeTab === 'account'
              ? 'border-b-2 border-pink-500 text-pink-500'
              : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Account & Security</span>
        </button>

        {isAdminOrMod && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`py-3 px-6 flex items-center gap-2 transition ${
              activeTab === 'admin'
                ? 'border-b-2 border-pink-500 text-pink-500'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Moderation Dashboard</span>
            {stats?.pendingReports > 0 && (
              <span className="w-4 h-4 rounded-full bg-pink-500 text-white text-[10px] flex items-center justify-center">
                {stats.pendingReports}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Account & Security Tab */}
      {activeTab === 'account' && (
        <div className="space-y-6 max-w-xl">
          {/* Change Password Card */}
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 backdrop-blur space-y-4">
            <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
              <Lock className="w-4 h-4 text-pink-500" />
              <span>Change Password</span>
            </h3>

            {passwordMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                {passwordMsg}
              </div>
            )}
            {passwordError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {passwordError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-300">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-pink-500 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-300">New Password (min 8 chars)</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-pink-500 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-300">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-pink-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={savingPassword}
                className="w-full py-2.5 rounded-xl font-semibold text-xs text-white insta-story-gradient hover:opacity-95 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {savingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>Update Password</span>
              </button>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 space-y-3">
            <h3 className="text-sm font-bold text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Danger Zone</span>
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Once you delete your account, all your posts, reels, messages, and social graph links are permanently removed. This action cannot be reversed.
            </p>
            <button
              onClick={handleDeleteAccount}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 transition flex items-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete My Account</span>
            </button>
          </div>
        </div>
      )}

      {/* Moderation Dashboard Tab */}
      {activeTab === 'admin' && isAdminOrMod && (
        <div className="space-y-6">
          {loadingAdmin ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
            </div>
          ) : (
            <>
              {/* Stats Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4 text-center">
                  <p className="text-xl font-bold text-neutral-100">{stats?.totalUsers || 0}</p>
                  <p className="text-[11px] text-neutral-400 mt-1">Total Users</p>
                </div>
                <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4 text-center">
                  <p className="text-xl font-bold text-neutral-100">{stats?.totalPosts || 0}</p>
                  <p className="text-[11px] text-neutral-400 mt-1">Posts</p>
                </div>
                <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4 text-center">
                  <p className="text-xl font-bold text-neutral-100">{stats?.totalReels || 0}</p>
                  <p className="text-[11px] text-neutral-400 mt-1">Reels</p>
                </div>
                <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4 text-center">
                  <p className="text-xl font-bold text-neutral-100">{stats?.totalReports || 0}</p>
                  <p className="text-[11px] text-neutral-400 mt-1">Total Reports</p>
                </div>
                <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4 text-center">
                  <p className="text-xl font-bold text-pink-500">{stats?.pendingReports || 0}</p>
                  <p className="text-[11px] text-neutral-400 mt-1">Pending Reports</p>
                </div>
              </div>

              {/* Pending Reports Section */}
              <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 backdrop-blur space-y-4">
                <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-pink-500" />
                  <span>Pending Moderation Queue</span>
                </h3>

                {reports.length === 0 ? (
                  <p className="text-xs text-neutral-500 py-4 text-center">All caught up! Zero pending reports.</p>
                ) : (
                  <div className="divide-y divide-neutral-800/60">
                    {reports.map((rep) => (
                      <div key={rep._id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="space-y-1">
                          <p className="font-semibold text-neutral-200">
                            Reported <span className="uppercase text-pink-400">{rep.targetType}</span> for{' '}
                            <span className="font-bold text-amber-400">{rep.reason}</span>
                          </p>
                          <p className="text-neutral-400 text-[11px]">Reporter: @{rep.reporter?.username} • {rep.description || 'No description'}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleResolveReport(rep._id, 'dismiss')}
                            className="px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold"
                          >
                            Dismiss
                          </button>
                          <button
                            onClick={() => handleResolveReport(rep._id, 'delete_target')}
                            className="px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-semibold"
                          >
                            Delete Target
                          </button>
                          <button
                            onClick={() => handleResolveReport(rep._id, 'ban_user')}
                            className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold"
                          >
                            Ban Author
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Users Moderation List */}
              <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 backdrop-blur space-y-4">
                <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                  <Users className="w-4 h-4 text-pink-500" />
                  <span>User Directory & Status</span>
                </h3>

                <div className="divide-y divide-neutral-800/60">
                  {adminUsers.map((u) => (
                    <div key={u._id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-[10px] uppercase">
                          {u.username?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-neutral-200">
                            @{u.username} <span className="text-[10px] text-neutral-500">({u.role})</span>
                          </p>
                          <p className="text-[10px] text-neutral-500">{u.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {u.isBanned ? (
                          <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded">Banned</span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Active</span>
                        )}

                        <button
                          onClick={() => handleToggleBan(u)}
                          className={`px-3 py-1 rounded-lg font-semibold transition ${
                            u.isBanned
                              ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                              : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                          }`}
                        >
                          {u.isBanned ? 'Unban' : 'Suspend'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
