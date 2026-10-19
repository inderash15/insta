import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Users, Loader2 } from 'lucide-react';
import api from '../../services/api';
import SearchNav from '../../components/search/SearchNav';

export default function SearchPeoplePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setUsers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/search/users?q=${encodeURIComponent(query.trim())}&limit=30`);
        setUsers(res.data?.users || []);
      } catch (err) {
        console.error('People search error:', err.message);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="w-full max-w-2xl mx-auto py-6 px-4 space-y-6">
      <SearchNav />

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSearchParams(e.target.value ? { q: e.target.value } : {});
          }}
          placeholder="Search by username or full name..."
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
              <Link
                key={u._id}
                to={`/users/${u.username}`}
                className="p-3.5 flex items-center justify-between hover:bg-neutral-800/40 transition-colors"
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
                <span className="text-[11px] font-semibold text-pink-400 hover:text-pink-300">
                  View Profile &rarr;
                </span>
              </Link>
            ))}
          </div>
        ) : query.trim() && !loading ? (
          <div className="py-16 text-center space-y-2">
            <p className="text-xs text-neutral-400">No users found matching &ldquo;{query}&rdquo;</p>
            <p className="text-[11px] text-neutral-500">Check spelling or try a different name</p>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-neutral-500">
            Type a username or person&apos;s name to find accounts.
          </div>
        )}
      </div>
    </div>
  );
}
