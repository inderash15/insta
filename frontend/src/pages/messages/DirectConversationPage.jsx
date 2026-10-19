import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Send, 
  Image as ImageIcon, 
  Info, 
  Search, 
  Loader2, 
  AlertCircle,
  Smile,
  Mic,
  Heart,
  Phone,
  Video,
  X,
  BadgeCheck
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
  const [otherProfile, setOtherProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [callingState, setCallingState] = useState(null);
  const [reactions, setReactions] = useState({});

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textInputRef = useRef(null);

  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Safe unique message appender that prevents duplicate messages
  const appendMessageUnique = (newMsg) => {
    if (!newMsg || !newMsg._id) return;
    setMessages((prev) => {
      if (prev.some((m) => m._id === newMsg._id)) {
        return prev; // already exists, skip
      }
      return [...prev, newMsg];
    });
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
        const other = conv.participants?.find((p) => p._id !== user?._id) || conv.participants?.[0];
        if (other?.username) {
          api.get(`/users/${other.username}`)
            .then((res) => {
              if (res.data?.success && res.data.user) {
                setOtherProfile(res.data.user);
              }
            })
            .catch(() => {});
        }
      }

      // 2. Fetch messages
      const msgsRes = await api.get(`/conversations/${conversationId}/messages`);
      if (msgsRes.data?.success) {
        setMessages(msgsRes.data.messages || []);
      }

      // 3. Mark read
      await api.post(`/conversations/${conversationId}/read`).catch(() => {});
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load conversation');
    } finally {
      setLoading(false);
      setTimeout(() => scrollToBottom('auto'), 50);
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

  // Real-time socket listener with deduplication
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (payload) => {
      if (payload.conversationId === conversationId && payload.message) {
        appendMessageUnique(payload.message);
        setTimeout(() => scrollToBottom('smooth'), 50);
        api.post(`/conversations/${conversationId}/read`).catch(() => {});
      }
    };

    socket.on('new_message', handleNewMessage);
    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [socket, conversationId]);

  // Handle file attachment preview
  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const url = URL.createObjectURL(selected);
      setFilePreview({ url, isVideo: selected.type.startsWith('video/') });
    }
  };

  const clearFile = () => {
    setFile(null);
    if (filePreview?.url) URL.revokeObjectURL(filePreview.url);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if ((!text.trim() && !file) || sending) return;

    setSending(true);
    setError('');

    const textToSend = text.trim();
    const fileToSend = file;

    // Reset input fields immediately for responsiveness
    setText('');
    clearFile();

    try {
      const formData = new FormData();
      if (textToSend) formData.append('text', textToSend);
      if (fileToSend) formData.append('media', fileToSend);

      const res = await api.post(`/conversations/${conversationId}/messages`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success && res.data.message) {
        // Append with deduplication (in case socket event arrived first)
        appendMessageUnique(res.data.message);
        setTimeout(() => scrollToBottom('smooth'), 50);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
      // restore text if failed
      setText(textToSend);
    } finally {
      setSending(false);
      textInputRef.current?.focus();
    }
  };

  // Instant Heart reaction / sticker sender (just like Instagram's heart button)
  const handleSendHeart = async () => {
    if (sending) return;
    setSending(true);
    try {
      const formData = new FormData();
      formData.append('text', '❤️');
      const res = await api.post(`/conversations/${conversationId}/messages`, formData);
      if (res.data?.success && res.data.message) {
        appendMessageUnique(res.data.message);
        setTimeout(() => scrollToBottom('smooth'), 50);
      }
    } catch (err) {
      setError('Failed to send heart');
    } finally {
      setSending(false);
    }
  };

  // Double click message to like with a heart
  const handleDoubleTapMessage = (msgId) => {
    setReactions((prev) => ({
      ...prev,
      [msgId]: prev[msgId] ? null : '❤️'
    }));
  };

  const otherParticipant = 
    conversation?.participants?.find((p) => (p._id || p.id) !== (user?._id || user?.id)) || 
    conversation?.participants?.[0];

  const profileToShow = otherProfile || otherParticipant;

  // Format date headers for Instagram style message grouping
  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const formatDateLabel = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const isYesterday = new Date(now.setDate(now.getDate() - 1)).toDateString() === d.toDateString();
    const timeStr = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    if (isToday) return `Today ${timeStr}`;
    if (isYesterday) return `Yesterday ${timeStr}`;
    return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeStr}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto h-[calc(100vh-80px)] flex flex-col bg-black border border-neutral-800/80 rounded-2xl shadow-2xl overflow-hidden my-2 select-text">
      {/* Instagram Header */}
      <div className="h-15 px-4 border-b border-neutral-800/80 flex items-center justify-between bg-black/95 backdrop-blur shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/direct')}
            className="p-1 -ml-1 rounded-full hover:bg-neutral-800/80 text-white transition cursor-pointer"
            title="Back to messages"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2]" />
          </button>

          {profileToShow && (
            <Link 
              to={`/users/${profileToShow.username}`} 
              className="flex items-center gap-3 group"
            >
              <div className="relative w-10 h-10 rounded-full bg-neutral-800 overflow-hidden shrink-0 border border-neutral-700/60">
                {profileToShow.avatarUrl ? (
                  <img src={profileToShow.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-sm text-neutral-200">
                    {profileToShow.username?.[0]?.toUpperCase()}
                  </div>
                )}
                {/* Active indicator dot */}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black" />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-[14px] font-semibold text-white tracking-tight leading-snug group-hover:opacity-80 transition">
                    {profileToShow.username}
                  </span>
                  {profileToShow.isVerified && (
                    <BadgeCheck className="w-4 h-4 text-sky-500 fill-sky-500" />
                  )}
                </div>
                <span className="text-[12px] text-neutral-400 font-normal leading-tight">
                  Active now
                </span>
              </div>
            </Link>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-4 text-white">
          <button 
            type="button"
            onClick={() => setCallingState('Audio Call')}
            className="hover:opacity-60 transition cursor-pointer"
            title="Start audio call"
          >
            <Phone className="w-5 h-5 stroke-[2]" />
          </button>
          <button 
            type="button"
            onClick={() => setCallingState('Video Call')}
            className="hover:opacity-60 transition cursor-pointer"
            title="Start video call"
          >
            <Video className="w-6 h-6 stroke-[2]" />
          </button>
          <Link
            to={`/direct/${conversationId}/search`}
            className="hover:opacity-60 transition"
            title="Search conversation"
          >
            <Search className="w-5 h-5 stroke-[2]" />
          </Link>
          <Link
            to={`/direct/${conversationId}/details`}
            className="hover:opacity-60 transition"
            title="Conversation details"
          >
            <Info className="w-6 h-6 stroke-[2]" />
          </Link>
        </div>
      </div>

      {/* Audio / Video Call Simulation Modal */}
      {callingState && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-sm w-full text-center space-y-4">
            <div className="w-20 h-20 rounded-full mx-auto overflow-hidden border-2 border-pink-500/50 p-1">
              {profileToShow?.avatarUrl ? (
                <img src={profileToShow.avatarUrl} alt="" className="w-full h-full object-cover rounded-full" />
              ) : (
                <div className="w-full h-full bg-neutral-800 rounded-full flex items-center justify-center text-xl font-bold text-white">
                  {profileToShow?.username?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">@{profileToShow?.username}</h3>
              <p className="text-xs text-neutral-400 mt-1">{callingState} ringing...</p>
            </div>
            <button
              onClick={() => setCallingState(null)}
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition"
            >
              End Call
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="p-2.5 mx-4 mt-2 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-xs shrink-0">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-0.5 no-scrollbar">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-neutral-500 animate-spin" />
          </div>
        ) : (
          <>
            {/* Top Instagram Profile Hero Card */}
            {profileToShow && (
              <div className="py-8 flex flex-col items-center justify-center text-center border-b border-neutral-800/60 mb-6">
                <Link to={`/users/${profileToShow.username}`} className="group">
                  <div className="w-24 h-24 rounded-full bg-neutral-800 p-0.5 border border-neutral-700 overflow-hidden shadow-lg group-hover:scale-105 transition-transform">
                    {profileToShow.avatarUrl ? (
                      <img src={profileToShow.avatarUrl} alt="" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <div className="w-full h-full bg-neutral-800 rounded-full flex items-center justify-center text-3xl font-bold text-white">
                        {profileToShow.username?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                </Link>

                <div className="mt-3.5 space-y-1">
                  <div className="flex items-center justify-center gap-1.5">
                    <h2 className="text-lg font-bold text-white tracking-tight">{profileToShow.fullName || profileToShow.username}</h2>
                    {profileToShow.isVerified && <BadgeCheck className="w-4 h-4 text-sky-500 fill-sky-500" />}
                  </div>
                  <p className="text-xs text-neutral-400 font-normal">
                    @{profileToShow.username} · Instagram
                  </p>
                  {profileToShow.followersCount !== undefined && (
                    <p className="text-[12px] text-neutral-500">
                      {profileToShow.followersCount} followers · {profileToShow.postsCount || 0} posts
                    </p>
                  )}
                </div>

                <Link
                  to={`/users/${profileToShow.username}`}
                  className="mt-4 px-4 py-1.5 rounded-lg bg-[#262626] hover:bg-[#333333] text-white text-[13px] font-semibold transition"
                >
                  View profile
                </Link>
              </div>
            )}

            {/* Empty Chat Greeting */}
            {messages.length === 0 && (
              <div className="py-12 flex flex-col items-center justify-center text-center text-neutral-500 space-y-1">
                <p className="text-sm font-medium text-neutral-400">No messages yet</p>
                <p className="text-xs">Send a message to start chatting with {profileToShow?.username || 'this user'}.</p>
              </div>
            )}

            {/* Messages List with Instagram Grouping */}
            {messages.map((m, idx) => {
              const currentUserId = user?._id || user?.id;
              const senderId = m.sender?._id || m.sender?.id || m.sender;
              const isMe = senderId === currentUserId;

              const prevMsg = messages[idx - 1];
              const nextMsg = messages[idx + 1];

              const prevSender = prevMsg ? (prevMsg.sender?._id || prevMsg.sender?.id || prevMsg.sender) : null;
              const nextSender = nextMsg ? (nextMsg.sender?._id || nextMsg.sender?.id || nextMsg.sender) : null;

              const isSameSenderAsPrev = prevSender === senderId;
              const isSameSenderAsNext = nextSender === senderId;

              // Time difference check (> 10 mins apart shows date label)
              const showDateHeader = !prevMsg || (new Date(m.createdAt) - new Date(prevMsg.createdAt) > 10 * 60 * 1000);

              // Distinct Instagram rounded corners for message clusters
              let roundedClass = 'rounded-[20px]';
              if (isMe) {
                if (!isSameSenderAsPrev && isSameSenderAsNext) {
                  roundedClass = 'rounded-[20px] rounded-br-[6px]';
                } else if (isSameSenderAsPrev && isSameSenderAsNext) {
                  roundedClass = 'rounded-[20px] rounded-r-[6px]';
                } else if (isSameSenderAsPrev && !isSameSenderAsNext) {
                  roundedClass = 'rounded-[20px] rounded-br-[4px]';
                } else {
                  roundedClass = 'rounded-[20px] rounded-br-[4px]';
                }
              } else {
                if (!isSameSenderAsPrev && isSameSenderAsNext) {
                  roundedClass = 'rounded-[20px] rounded-bl-[6px]';
                } else if (isSameSenderAsPrev && isSameSenderAsNext) {
                  roundedClass = 'rounded-[20px] rounded-l-[6px]';
                } else if (isSameSenderAsPrev && !isSameSenderAsNext) {
                  roundedClass = 'rounded-[20px] rounded-bl-[4px]';
                } else {
                  roundedClass = 'rounded-[20px] rounded-bl-[4px]';
                }
              }

              // Is this the very last message in the entire chat?
              const isLastMessage = idx === messages.length - 1;

              return (
                <React.Fragment key={m._id || `temp-${idx}`}>
                  {/* Instagram Centered Date Header */}
                  {showDateHeader && (
                    <div className="py-4 text-center">
                      <span className="text-[11px] font-medium text-neutral-500 tracking-tight">
                        {formatDateLabel(m.createdAt)}
                      </span>
                    </div>
                  )}

                  <div 
                    className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'} ${
                      isSameSenderAsPrev ? 'mt-0.5' : 'mt-2.5'
                    } group`}
                  >
                    {/* Small avatar for received messages (only shown on the last message of a cluster) */}
                    {!isMe && (
                      <div className="w-7 h-7 shrink-0 mb-0.5">
                        {!isSameSenderAsNext ? (
                          <div className="w-7 h-7 rounded-full bg-neutral-800 overflow-hidden border border-neutral-700">
                            {profileToShow?.avatarUrl ? (
                              <img src={profileToShow.avatarUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-[10px] text-white">
                                {profileToShow?.username?.[0]?.toUpperCase()}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-7 h-7" />
                        )}
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div className="relative max-w-[70%] sm:max-w-[60%] flex flex-col">
                      <div
                        onDoubleClick={() => handleDoubleTapMessage(m._id)}
                        className={`relative px-4 py-2 text-[14px] leading-5 select-text break-words transition-all ${roundedClass} ${
                          isMe
                            ? 'bg-gradient-to-r from-[#7000ff] via-[#9400d3] to-[#c800ff] text-white shadow-sm'
                            : 'bg-[#262626] text-white'
                        }`}
                        title={`Sent at ${formatTime(m.createdAt)} (Double tap to like)`}
                      >
                        {/* Media display */}
                        {m.mediaUrl && (
                          <div className="mb-1.5 rounded-xl overflow-hidden bg-black/40">
                            {m.mediaType === 'video' ? (
                              <video src={m.mediaUrl} controls className="max-h-72 w-full object-cover rounded-lg" />
                            ) : (
                              <img src={m.mediaUrl} alt="" className="max-h-72 w-full object-cover rounded-lg cursor-pointer" />
                            )}
                          </div>
                        )}

                        {/* Plain text */}
                        {m.text && (
                          <p className={`${m.text === '❤️' ? 'text-3xl py-1' : ''}`}>
                            {m.text}
                          </p>
                        )}

                        {/* Reaction sticker badge */}
                        {reactions[m._id] && (
                          <div className="absolute -bottom-2 -right-1 bg-[#262626] rounded-full px-1.5 py-0.5 text-[11px] shadow-md border border-neutral-700 flex items-center justify-center">
                            {reactions[m._id]}
                          </div>
                        )}
                      </div>

                      {/* Seen indicator beneath last sent message */}
                      {isMe && isLastMessage && (
                        <div className="text-right mt-1 pr-1">
                          <span className="text-[10px] text-neutral-400 font-medium">Seen</span>
                        </div>
                      )}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Media Attachment Preview Pill */}
      {filePreview && (
        <div className="px-4 py-2 bg-neutral-900 border-t border-neutral-800/80 flex items-center gap-3">
          <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-black border border-neutral-700">
            {filePreview.isVideo ? (
              <video src={filePreview.url} className="w-full h-full object-cover" />
            ) : (
              <img src={filePreview.url} alt="" className="w-full h-full object-cover" />
            )}
            <button
              onClick={clearFile}
              className="absolute top-1 right-1 p-0.5 rounded-full bg-black/70 text-white hover:bg-black"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <span className="text-xs text-neutral-300 truncate max-w-xs">{file?.name}</span>
        </div>
      )}

      {/* Instagram Pill Input Bar */}
      <div className="p-3 bg-black border-t border-neutral-800/80 shrink-0">
        <form onSubmit={handleSendMessage} className="w-full min-h-[44px] bg-[#262626] border border-neutral-700/60 rounded-full px-4 py-1.5 flex items-center gap-3 focus-within:border-neutral-500 transition">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Left Emoji Smile Button */}
          <button
            type="button"
            onClick={() => {
              setText((prev) => prev + ' 😊');
              textInputRef.current?.focus();
            }}
            className="text-white/80 hover:text-white transition cursor-pointer shrink-0"
            title="Emoji"
          >
            <Smile className="w-6 h-6 stroke-[1.8]" />
          </button>

          {/* Text Input */}
          <input
            ref={textInputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Message..."
            className="flex-1 bg-transparent border-none text-white text-[14px] placeholder:text-neutral-500 focus:outline-none min-w-0 py-1"
          />

          {/* Right Action Icons */}
          {text.trim() || file ? (
            /* When text or file is present, show "Send" button in Instagram Blue */
            <button
              type="submit"
              disabled={sending}
              className="text-[#0095f6] hover:text-white font-semibold text-[14px] px-1 cursor-pointer transition shrink-0 disabled:opacity-50"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin text-sky-500" /> : 'Send'}
            </button>
          ) : (
            /* When input is empty, show Gallery, Mic, and Heart sticker icons */
            <div className="flex items-center gap-3 text-white/80">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="hover:text-white transition cursor-pointer shrink-0"
                title="Attach photo or video"
              >
                <ImageIcon className="w-5 h-5 stroke-[1.8]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setText((prev) => prev + ' 🎙️');
                  textInputRef.current?.focus();
                }}
                className="hover:text-white transition cursor-pointer shrink-0"
                title="Voice message"
              >
                <Mic className="w-5 h-5 stroke-[1.8]" />
              </button>

              <button
                type="button"
                onClick={handleSendHeart}
                disabled={sending}
                className="hover:text-red-500 active:scale-125 transition-transform cursor-pointer shrink-0 text-white/80"
                title="Send a heart"
              >
                <Heart className="w-5 h-5 stroke-[1.8] hover:fill-red-500 hover:text-red-500 transition-colors" />
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
