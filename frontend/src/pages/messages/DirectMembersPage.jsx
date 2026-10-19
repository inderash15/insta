import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Users, UserPlus, Shield, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function DirectMembersPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConv = async () => {
      setLoading(true);
      try {
        const res = await api.get('/conversations');
        const conv = res.data?.conversations?.find((c) => c._id === conversationId);
        setConversation(conv || null);
      } catch (err) {
        console.error('Failed to load chat members:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConv();
  }, [conversationId]);

  return (
    <div className="w-full max-w-xl mx-auto py-6 px-4 space-y-6">
      <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
        <button
          onClick={() => navigate(`/direct/${conversationId}/details`)}
          className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-base font-bold text-neutral-100">Chat Members</h1>
          <p className="text-xs text-neutral-400">People participating in this conversation</p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-6 h-6 text-pink-500 animate-spin" />
        </div>
      ) : !conversation ? (
        <div className="py-20 text-center text-xs text-neutral-500">
          Conversation not found
        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl divide-y divide-neutral-800/60 overflow-hidden">
          {conversation.participants?.map((p) => (
            <div
              key={p._id}
              className="p-3.5 flex items-center justify-between hover:bg-neutral-800/40 transition-colors"
            >
              <Link to={`/users/${p.username}`} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-800 overflow-hidden flex items-center justify-center font-bold text-xs text-white border border-neutral-700">
                  {p.avatarUrl ? (
                    <img src={p.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    p.username?.[0]?.toUpperCase()
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-100 hover:underline">@{p.username}</p>
                  <p className="text-[11px] text-neutral-400">{p.fullName}</p>
                </div>
              </Link>

              <div className="flex items-center gap-2">
                {p._id === user?._id ? (
                  <span className="text-[10px] font-semibold text-neutral-400 px-2.5 py-1 rounded-full bg-neutral-800 border border-neutral-700">
                    You
                  </span>
                ) : (
                  <Link
                    to={`/users/${p.username}`}
                    className="text-xs font-semibold text-pink-400 hover:underline"
                  >
                    Profile
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
