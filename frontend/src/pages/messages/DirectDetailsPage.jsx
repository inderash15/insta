import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Users, Bell, Image as ImageIcon, Search, Shield, Trash2, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function DirectDetailsPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await api.get('/conversations');
        const conv = res.data?.conversations?.find((c) => c._id === conversationId);
        setConversation(conv || null);
      } catch (err) {
        console.error('Failed to load conversation details:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [conversationId]);

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
          <h1 className="text-base font-bold text-neutral-100">Conversation Details</h1>
          <p className="text-xs text-neutral-400">Settings and information for this chat</p>
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
        <div className="space-y-4">
          {/* Members */}
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-200">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-pink-400" />
                <span>Participants ({conversation.participants?.length || 0})</span>
              </span>
              <Link
                to={`/direct/${conversationId}/members`}
                className="text-pink-400 hover:underline text-[11px]"
              >
                Manage
              </Link>
            </div>

            <div className="space-y-2">
              {conversation.participants?.map((p) => (
                <Link
                  key={p._id}
                  to={`/users/${p.username}`}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-neutral-800/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-neutral-800 overflow-hidden flex items-center justify-center font-bold text-xs text-white">
                      {p.avatarUrl ? (
                        <img src={p.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        p.username?.[0]?.toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-neutral-200">@{p.username}</p>
                      <p className="text-[10px] text-neutral-400">{p.fullName}</p>
                    </div>
                  </div>
                  {p._id === user?._id && (
                    <span className="text-[10px] text-neutral-500 px-2 py-0.5 rounded bg-neutral-800">You</span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl divide-y divide-neutral-800/60 overflow-hidden">
            <Link
              to={`/direct/${conversationId}/media`}
              className="p-3.5 flex items-center justify-between hover:bg-neutral-800/40 transition-colors text-xs text-neutral-200"
            >
              <div className="flex items-center gap-2.5">
                <ImageIcon className="w-4 h-4 text-purple-400" />
                <span>View Shared Media & Files</span>
              </div>
              <span className="text-neutral-500">&rarr;</span>
            </Link>

            <Link
              to={`/direct/${conversationId}/search`}
              className="p-3.5 flex items-center justify-between hover:bg-neutral-800/40 transition-colors text-xs text-neutral-200"
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-4 h-4 text-sky-400" />
                <span>Search in Conversation</span>
              </div>
              <span className="text-neutral-500">&rarr;</span>
            </Link>

            <div className="p-3.5 flex items-center justify-between text-xs text-neutral-200">
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-amber-400" />
                <span>Mute Notifications</span>
              </div>
              <input
                type="checkbox"
                checked={muted}
                onChange={() => setMuted(!muted)}
                className="w-4 h-4 accent-pink-500 rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
