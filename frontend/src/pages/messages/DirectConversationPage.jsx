import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Send, 
  Image as ImageIcon, 
  Info, 
  Search, 
  CheckCheck, 
  Check, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

export default function DirectConversationPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChat = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch conversations to find metadata
      const convsRes = await api.get('/conversations');
      const conv = convsRes.data?.conversations?.find((c) => c._id === conversationId);
      if (conv) {
        setConversation(conv);
      }

      // 2. Fetch messages
      const msgsRes = await api.get(`/conversations/${conversationId}/messages`);
      if (msgsRes.data?.success) {
        setMessages(msgsRes.data.messages || []);
      }

      // 3. Mark read
      await api.post(`/conversations/${conversationId}/read`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load conversation');
    } finally {
      setLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  useEffect(() => {
    if (conversationId) {
      fetchChat();
      if (socket) {
        socket.emit('join_conversation', conversationId);
      }
    }
  }, [conversationId, socket]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (payload) => {
      if (payload.conversationId === conversationId && payload.message) {
        setMessages((prev) => [...prev, payload.message]);
        setTimeout(scrollToBottom, 50);
        api.post(`/conversations/${conversationId}/read`).catch(() => {});
      }
    };

    socket.on('new_message', handleNewMessage);
    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [socket, conversationId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !file) return;

    setSending(true);
    setError('');

    try {
      const formData = new FormData();
      if (text.trim()) formData.append('text', text.trim());
      if (file) formData.append('media', file);

      const res = await api.post(`/conversations/${conversationId}/messages`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success && res.data.message) {
        setMessages((prev) => [...prev, res.data.message]);
        setText('');
        setFile(null);
        setTimeout(scrollToBottom, 50);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const otherParticipant = conversation?.participants?.find((p) => p._id !== user?._id) || conversation?.participants?.[0];

  return (
    <div className="w-full max-w-2xl mx-auto h-[86vh] flex flex-col bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl overflow-hidden my-4">
      {/* Header */}
      <div className="p-3.5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/direct')}
            className="p-1.5 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {otherParticipant && (
            <Link to={`/users/${otherParticipant.username}`} className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-full bg-neutral-800 overflow-hidden flex items-center justify-center font-bold text-xs text-white border border-neutral-700">
                {otherParticipant.avatarUrl ? (
                  <img src={otherParticipant.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  otherParticipant.username?.[0]?.toUpperCase()
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-100 group-hover:underline">
                  @{otherParticipant.username}
                </p>
                <p className="text-[10px] text-neutral-400">{otherParticipant.fullName || 'Direct Chat'}</p>
              </div>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/direct/${conversationId}/search`}
            className="p-2 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white"
            title="Search in conversation"
          >
            <Search className="w-4 h-4" />
          </Link>
          <Link
            to={`/direct/${conversationId}/details`}
            className="p-2 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white"
            title="Conversation details"
          >
            <Info className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-2.5 mx-3 mt-2 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-pink-500 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-2 text-neutral-500 text-xs">
            <p className="font-semibold text-neutral-300">No messages yet</p>
            <p>Say hello to start the conversation!</p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.sender?._id === user?._id || m.sender === user?._id;
            return (
              <div
                key={m._id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
              >
                <div
                  className={`max-w-[75%] p-3 rounded-2xl text-xs ${
                    isMe
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-br-sm shadow-md'
                      : 'bg-neutral-800 text-neutral-100 rounded-bl-sm'
                  }`}
                >
                  {m.mediaUrl && (
                    <div className="mb-2 rounded-lg overflow-hidden bg-black/40">
                      {m.mediaType === 'video' ? (
                        <video src={m.mediaUrl} controls className="max-h-60 w-full object-cover" />
                      ) : (
                        <img src={m.mediaUrl} alt="" className="max-h-60 w-full object-cover" />
                      )}
                    </div>
                  )}
                  {m.text && <p className="leading-relaxed break-words">{m.text}</p>}
                </div>
                <span className="text-[10px] text-neutral-500 px-1">
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-neutral-800 bg-neutral-950/60 flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`p-2 rounded-xl transition-colors ${
            file ? 'bg-pink-500/20 text-pink-400' : 'hover:bg-neutral-800 text-neutral-400 hover:text-white'
          }`}
          title="Attach image or video"
        >
          <ImageIcon className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={file ? `File attached: ${file.name}` : 'Write a message...'}
          className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-pink-500"
        />

        <button
          type="submit"
          disabled={(!text.trim() && !file) || sending}
          className="p-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white disabled:opacity-40 hover:opacity-90 transition-opacity cursor-pointer"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
}
