import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Loader2 } from 'lucide-react';
import api from '../../services/api';

export default function DirectSearchPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [allMessages, setAllMessages] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllMessages = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/conversations/${conversationId}/messages?limit=100`);
        if (res.data?.success) {
          setAllMessages(res.data.messages || []);
        }
      } catch (err) {
        console.error('Failed to load messages for search:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllMessages();
  }, [conversationId]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const filtered = allMessages.filter((m) =>
      m.text?.toLowerCase().includes(query.toLowerCase().trim())
    );
    setResults(filtered);
  }, [query, allMessages]);

  return (
    <div className="w-full max-w-xl mx-auto py-6 px-4 space-y-6">
      <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
        <button
          onClick={() => navigate(`/direct/${conversationId}`)}
          className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-base font-bold text-neutral-100">Search in Conversation</h1>
          <p className="text-xs text-neutral-400">Find messages exchanged in this chat</p>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type keywords to search message text..."
          className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-pink-500 shadow-md transition-colors"
          autoFocus
        />
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-6 h-6 text-pink-500 animate-spin" />
          </div>
        ) : query.trim() ? (
          results.length > 0 ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl divide-y divide-neutral-800/60 overflow-hidden">
              {results.map((m) => (
                <div key={m._id} className="p-3.5 space-y-1 hover:bg-neutral-800/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-200">
                      @{m.sender?.username}
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      {new Date(m.createdAt).toLocaleDateString()} {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300">{m.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-xs text-neutral-500">
              No messages found matching &ldquo;{query}&rdquo;
            </div>
          )
        ) : (
          <div className="py-16 text-center text-xs text-neutral-500">
            Search for words, phrases, or links in this chat history.
          </div>
        )}
      </div>
    </div>
  );
}
