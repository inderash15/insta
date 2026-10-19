import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, MapPin, Loader2, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import SearchNav from '../../components/search/SearchNav';

export default function SearchPlacesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/search/places?q=${encodeURIComponent(query.trim())}`);
        setPlaces(res.data?.places || []);
      } catch (err) {
        console.error('Places search error:', err.message);
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
          <MapPin className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSearchParams(e.target.value ? { q: e.target.value } : {});
          }}
          placeholder="Search locations, venues, cities..."
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
        {places.length > 0 ? (
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl divide-y divide-neutral-800/60 overflow-hidden">
            {places.map((p) => (
              <div
                key={p.place}
                className="p-3.5 flex items-center justify-between hover:bg-neutral-800/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-200">{p.place}</p>
                    <p className="text-[11px] text-neutral-400">{p.count} tagged posts</p>
                  </div>
                </div>
                <Link
                  to={`/search/posts?q=${encodeURIComponent(p.place)}`}
                  className="text-xs text-pink-400 font-semibold hover:underline"
                >
                  View Posts
                </Link>
              </div>
            ))}
          </div>
        ) : query.trim() && !loading ? (
          <div className="py-16 text-center space-y-2">
            <p className="text-xs text-neutral-400">No places found matching &ldquo;{query}&rdquo;</p>
            <p className="text-[11px] text-neutral-500">Try searching for famous landmarks or major cities</p>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-neutral-500">
            Search for locations to see moments shared from around the world.
          </div>
        )}
      </div>
    </div>
  );
}
