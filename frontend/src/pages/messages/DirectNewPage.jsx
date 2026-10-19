import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, ArrowLeft, Loader2, MessageSquare, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import DirectNav from '../../components/messages/DirectNav';

export default function DirectNewPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!query.trim()) {
      setUsers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/search/users?q=${encodeURIComponent(query.trim())}&limit=20`);
        setUsers(res.data?.users || []);
      } catch (err) {
        console.error('New chat search error:', err.message);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleStartChat = async (recipientId) => {
    setStarting(true);
    setError('');
    try {
      const res = await api.post('/conversations', { recipientId });
      if (res.data?.success && res.data.conversation?._id) {
        navigate(`/direct/${res.data.conversation._id}`);
      } else {
        setError('Failed to start chat.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not initiate conversation');
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto py-6 px-4 space-y-6">
      <DirectNav />

      <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
        <button
          onClick={() => navigate('/direct')}
          className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-base font-bold text-neutral-100">New Message</h1>
          <p className="text-xs text-neutral-400">Search for a friend or creator to start chatting</p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type username or name..."
          className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-pink-500 shadow-md transition-colors"
          autoFocus
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
            <Loader2 className="w-4 h-4 text-pink-500 animate-spin" />
          </div>
        )}
      </div>

      <div className="space-y-3">
        {users.length > 0 ? (
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl divide-y divide-neutral-800/60 overflow-hidden">
            {users.map((u) => (
              <div
                key={u._id}
                onClick={() => !starting && handleStartChat(u._id)}
                className="p-3.5 flex items-center justify-between hover:bg-neutral-800/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-neutral-800 overflow-hidden flex items-center justify-center font-bold text-xs text-white">
                    {u.avatarUrl ? (
                      <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      u.username[0]?.toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-200">@{u.username}</p>
                    <p className="text-[11px] text-neutral-400">{u.fullName}</p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={starting}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-90 transition-opacity"
                >
                  Chat
                </button>
              </div>
            ))}
          </div>
        ) : query.trim() && !loading ? (
          <div className="py-16 text-center text-xs text-neutral-500">
            No accounts found matching &ldquo;{query}&rdquo;.
          </div>
        ) : (
          <div className="py-16 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 mx-auto flex items-center justify-center text-neutral-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-neutral-300">Find someone to message</p>
            <p className="text-[11px] text-neutral-500">Search above to open a direct or group conversation.</p>
          </div>
        )}
      </div>
    </div>
  );
}
