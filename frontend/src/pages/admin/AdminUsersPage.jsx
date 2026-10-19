import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  ShieldAlert, 
  Ban, 
  CheckCircle2, 
  BadgeCheck, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import api from '../../services/api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users?q=${encodeURIComponent(search.trim())}`);
      if (res.data?.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error('Failed to load admin users:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const handleUpdateUser = async (userId, updates) => {
    setActionLoading(userId);
    try {
      const res = await api.patch(`/admin/users/${userId}`, updates);
      if (res.data?.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, ...updates } : u))
        );
        setMessage('User updated successfully.');
        setTimeout(() => setMessage(''), 2000);
      }
    } catch (err) {
      console.error('Failed to update user:', err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-neutral-800 pb-4">
        <h1 className="text-xl font-bold text-neutral-100 flex items-center gap-2.5">
          <Users className="w-6 h-6 text-pink-500" />
          <span>User Management</span>
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Inspect, ban, unban, verify, and moderate registered accounts
        </p>
      </div>

      {message && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-400 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by username, email, or name..."
          className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-pink-500 transition-colors"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-24 flex justify-center">
          <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="py-20 text-center text-xs text-neutral-500">
          No users found matching query.
        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950/80 text-neutral-400 font-semibold border-b border-neutral-800">
                <tr>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {users.map((u) => {
                  const isBusy = actionLoading === u._id;
                  return (
                    <tr key={u._id} className="hover:bg-neutral-850/50 transition-colors">
                      <td className="p-3.5 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-neutral-800 overflow-hidden flex items-center justify-center font-bold text-xs text-white shrink-0">
                          {u.avatarUrl ? (
                            <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            u.username?.[0]?.toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-neutral-100">@{u.username}</span>
                            {u.isVerified && (
                              <BadgeCheck className="w-3.5 h-3.5 text-sky-400 fill-sky-400/20" />
                            )}
                          </div>
                          <p className="text-[10px] text-neutral-400">{u.fullName}</p>
                        </div>
                      </td>

                      <td className="p-3.5 font-mono text-[11px] text-neutral-300">
                        {u.email}
                      </td>

                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-neutral-800 text-neutral-300">
                          {u.role || 'user'}
                        </span>
                      </td>

                      <td className="p-3.5">
                        {u.isBanned ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                            Banned
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Active
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleUpdateUser(u._id, { isVerified: !u.isVerified })}
                          disabled={isBusy}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
                        >
                          {u.isVerified ? 'Unverify' : 'Verify'}
                        </button>

                        <button
                          onClick={() => handleUpdateUser(u._id, { isBanned: !u.isBanned })}
                          disabled={isBusy}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                            u.isBanned
                              ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                              : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                          }`}
                        >
                          {u.isBanned ? 'Unban' : 'Ban'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
