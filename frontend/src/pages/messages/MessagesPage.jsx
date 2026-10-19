import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Image as ImageIcon, 
  MessageSquare, 
  UserPlus, 
  Search, 
  Check, 
  CheckCheck, 
  Loader2, 
  Smile, 
  Heart,
  Phone, 
  Video 
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import DirectNav from '../../components/messages/DirectNav';
import NotesTray from '../../components/notes/NotesTray';

export default function MessagesPage() {
  const { user } = useAuth();
  const { socket, onlineUserIds, lastSeenMap, setUnreadMessages } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(timer);
  }, []);

  // Format active status just like Instagram
  const formatActiveStatus = (online, lastActive) => {
    if (online) return 'Active now';
    if (!lastActive) return 'Active recently';
    try {
      const d = new Date(lastActive);
      if (isNaN(d.getTime())) return 'Active recently';
      const now = new Date();
      const diffMs = Math.max(0, now.getTime() - d.getTime());
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Active just now';
      if (diffMins < 60) return `Active ${diffMins}m ago`;
      if (diffHours < 24) return `Active ${diffHours}h ago`;
      if (diffDays === 1) return 'Active yesterday';
      if (diffDays < 7) return `Active ${diffDays}d ago`;
      return `Active ${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
    } catch (e) {
      return 'Active recently';
    }
  };

  const formatSeenTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      const now = new Date();
      const diffMs = Math.max(0, now.getTime() - d.getTime());
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  // Fetch all conversations
  const fetchConversations = async () => {
    setLoadingConv(true);
    try {
      const res = await api.get('/conversations');
      if (res.data?.success) {
        setConversations(res.data.conversations || []);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err.message);
    } finally {
      setLoadingConv(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Fetch messages for active conversation
  const fetchMessages = async (convId) => {
    setLoadingMsgs(true);
    try {
      const res = await api.get(`/conversations/${convId}/messages`);
      if (res.data?.success) {
        setMessages(res.data.messages || []);
        // Update local conversation unread count
        setConversations((prev) =>
          prev.map((c) => (c._id === convId ? { ...c, unreadCount: 0 } : c))
        );
      }
    } catch (err) {
      console.error('Error fetching messages:', err.message);
    } finally {
      setLoadingMsgs(false);
    }
  };

  const handleSelectConversation = (conv) => {
    setActiveConv(conv);
    fetchMessages(conv._id);
    if (socket) {
      socket.emit('join_conversation', conv._id);
      socket.emit('mark_read', { conversationId: conv._id, userId: user?._id || user?.id });
    }
  };

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = ({ conversationId, message }) => {
      if (activeConv && activeConv._id === conversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
        api.post(`/conversations/${conversationId}/read`).catch(() => {});
        socket.emit('mark_read', { conversationId, userId: user?._id || user?.id });
      }

      // Update conversations list snippet
      setConversations((prev) => {
        const found = prev.find((c) => c._id === conversationId);
        if (!found) {
          fetchConversations();
          return prev;
        }
        return prev.map((c) =>
          c._id === conversationId
            ? {
                ...c,
                lastMessage: message,
                lastMessageAt: message.createdAt,
                unreadCount: activeConv?._id === conversationId ? 0 : (c.unreadCount || 0) + 1
              }
            : c
        ).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
      });
    };

    const handleMessageSent = ({ conversationId: cId, message }) => {
      if (activeConv && activeConv._id === cId && message) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === message._id || (m.clientTempId && m.clientTempId === message.clientTempId)
              ? { ...message, status: 'sent' }
              : m
          )
        );
      }
    };

    const handleMessageDelivered = ({ conversationId: cId, messageId, deliveredTo }) => {
      if (activeConv && activeConv._id === cId) {
        setMessages((prev) =>
          prev.map((m) => {
            if (m._id === messageId || !messageId) {
              return {
                ...m,
                deliveredTo: deliveredTo || m.deliveredTo || []
              };
            }
            return m;
          })
        );
      }
    };

    const handleMessagesRead = ({ conversationId, userId: readerId, readAt }) => {
      if (activeConv && activeConv._id === conversationId) {
        setMessages((prev) =>
          prev.map((m) => {
            const senderId = (m.sender?._id || m.sender?.id || m.sender)?.toString();
            const currentUserId = (user?._id || user?.id)?.toString();
            if (senderId === currentUserId) {
              const readBy = m.readBy || [];
              if (!readBy.some((r) => (r.user?._id || r.user)?.toString() === readerId?.toString())) {
                return {
                  ...m,
                  readBy: [...readBy, { user: readerId, readAt: readAt || new Date() }]
                };
              }
            }
            return m;
          })
        );
      }
    };

    const handleTypingStart = ({ conversationId, username }) => {
      if (activeConv && activeConv._id === conversationId) {
        setTypingUser(username);
      }
    };

    const handleTypingStop = ({ conversationId }) => {
      if (activeConv && activeConv._id === conversationId) {
        setTypingUser(null);
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('message:sent', handleMessageSent);
    socket.on('message:delivered', handleMessageDelivered);
    socket.on('messages_read', handleMessagesRead);
    socket.on('message:receipt', handleMessagesRead);
    socket.on('typing_start', handleTypingStart);
    socket.on('typing_stop', handleTypingStop);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('message:sent', handleMessageSent);
      socket.off('message:delivered', handleMessageDelivered);
      socket.off('messages_read', handleMessagesRead);
      socket.off('message:receipt', handleMessagesRead);
      socket.off('typing_start', handleTypingStart);
      socket.off('typing_stop', handleTypingStop);
    };
  }, [socket, activeConv, user]);

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUser]);

  // Handle typing input
  const handleInputChange = (e) => {
    setMessageText(e.target.value);

    if (!socket || !activeConv) return;
    socket.emit('typing_start', {
      conversationId: activeConv._id,
      userId: user._id || user.id,
      username: user.username
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', {
        conversationId: activeConv._id,
        userId: user._id || user.id
      });
    }, 1500);
  };

  // Send message with optimistic pending state
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConv) return;

    const textToSend = messageText.trim();
    setMessageText('');

    if (socket && activeConv) {
      socket.emit('typing_stop', {
        conversationId: activeConv._id,
        userId: user._id || user.id
      });
    }

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const optimisticMsg = {
      _id: tempId,
      clientTempId: tempId,
      status: 'sending',
      conversation: activeConv._id,
      sender: user,
      text: textToSend,
      mediaUrl: null,
      mediaType: null,
      createdAt: new Date().toISOString(),
      sentAt: null,
      deliveredTo: [],
      readBy: []
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await api.post(`/conversations/${activeConv._id}/messages`, {
        text: textToSend
      });
      if (res.data?.success && res.data.message) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === tempId || m.clientTempId === tempId
              ? { ...res.data.message, status: 'sent' }
              : m
          )
        );
      }
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === tempId || m.clientTempId === tempId
            ? { ...m, status: 'failed' }
            : m
        )
      );
    }
  };

  // Retry sending failed message
  const handleRetryMessage = async (failedMsg) => {
    if (!failedMsg || !activeConv) return;
    setMessages((prev) =>
      prev.map((m) =>
        m._id === failedMsg._id || m.clientTempId === failedMsg.clientTempId
          ? { ...m, status: 'sending' }
          : m
      )
    );

    try {
      const res = await api.post(`/conversations/${activeConv._id}/messages`, {
        text: failedMsg.text
      });
      if (res.data?.success && res.data.message) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === failedMsg._id || m.clientTempId === failedMsg.clientTempId
              ? { ...res.data.message, status: 'sent' }
              : m
          )
        );
      }
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === failedMsg._id || m.clientTempId === failedMsg.clientTempId
            ? { ...m, status: 'failed' }
            : m
        )
      );
    }
  };

  // Start new chat with searched user
  const handleStartChat = async (recipient) => {
    try {
      const res = await api.post('/conversations', { recipientId: recipient._id });
      if (res.data?.success) {
        setShowNewChatModal(false);
        setSearchUserQuery('');
        setUserSearchResults([]);
        await fetchConversations();
        handleSelectConversation(res.data.conversation);
      }
    } catch (err) {
      alert(err.message || 'Failed to start conversation');
    }
  };

  // Search users for new chat
  useEffect(() => {
    if (!searchUserQuery.trim()) {
      setUserSearchResults([]);
      return;
    }

    const t = setTimeout(async () => {
      try {
        const res = await api.get(`/search/users?q=${encodeURIComponent(searchUserQuery.trim())}`);
        setUserSearchResults(res.data?.users || []);
      } catch {}
    }, 250);

    return () => clearTimeout(t);
  }, [searchUserQuery]);

  // Get recipient participant in 2-party chat
  const getRecipient = (conv) => {
    return conv.participants?.find(
      (p) => (p._id || p.id) !== (user?._id || user?.id)
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto h-[86vh] max-h-[820px] my-4 px-2 sm:px-4 flex flex-col">
      <DirectNav />
      <div className="w-full flex-1 min-h-0 bg-neutral-900/60 border border-neutral-800 rounded-2xl overflow-hidden backdrop-blur flex shadow-2xl">
        {/* Left Conversations Sidebar */}
        <div className={`w-full sm:w-80 md:w-96 border-r border-neutral-800 flex flex-col ${activeConv ? 'hidden sm:flex' : 'flex'}`}>
          {/* Header */}
          <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
              <span>{user?.username}</span>
            </h2>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              title="New Message"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          </div>

          {/* Social Notes Horizontal Tray */}
          <div className="px-3 pt-3">
            <NotesTray />
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto divide-y divide-neutral-800/40">
            {loadingConv ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="w-6 h-6 text-pink-500 animate-spin" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-500 space-y-2">
                <MessageSquare className="w-8 h-8 text-neutral-600 mx-auto" />
                <p>No conversations yet.</p>
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="text-pink-500 font-bold hover:underline"
                >
                  Start a new chat
                </button>
              </div>
            ) : (
              conversations.map((conv) => {
                const recipient = getRecipient(conv);
                const isOnline = recipient && onlineUserIds.has(recipient._id?.toString() || recipient.id?.toString());
                const isSelected = activeConv?._id === conv._id;

                return (
                  <div
                    key={conv._id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`flex items-center gap-3 p-3.5 cursor-pointer transition ${
                      isSelected ? 'bg-neutral-800/70' : 'hover:bg-neutral-850/50'
                    }`}
                  >
                    {/* Avatar with online status ring */}
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-sm text-neutral-200 overflow-hidden">
                        {recipient?.avatarUrl ? (
                          <img src={recipient.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          recipient?.username?.charAt(0) || 'U'
                        )}
                      </div>
                      {isOnline && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-neutral-900 rounded-full" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-neutral-200 truncate">
                          {recipient?.username || 'Chat'}
                        </p>
                        {conv.lastMessageAt && (
                          <span className="text-[10px] text-neutral-500 shrink-0">
                            {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <p className={`text-[11px] truncate ${conv.unreadCount > 0 ? 'text-neutral-100 font-semibold' : 'text-neutral-400'}`}>
                          {conv.lastMessage?.text || 'Sent an attachment'}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="w-4 h-4 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Active Chat Panel */}
        <div className={`flex-1 flex flex-col bg-neutral-950/40 ${!activeConv ? 'hidden sm:flex' : 'flex'}`}>
          {!activeConv ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
              <div className="w-20 h-20 rounded-full border-2 border-neutral-800 flex items-center justify-center text-neutral-400">
                <MessageSquare className="w-10 h-10 stroke-[1.5]" />
              </div>
              <h3 className="text-base font-bold text-neutral-100">Your Messages</h3>
              <p className="text-xs text-neutral-500 max-w-xs">
                Send private messages and photos to a friend or group.
              </p>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white insta-story-gradient hover:opacity-90 transition shadow-lg shadow-pink-500/20"
              >
                Send Message
              </button>
            </div>
          ) : (
            <>
              {/* Active Chat Header */}
              {(() => {
                const recipient = getRecipient(activeConv);
                const recipientId = recipient ? (recipient._id || recipient.id)?.toString() : null;
                const isOnline = Boolean(recipientId && onlineUserIds?.has(recipientId));
                const lastActiveTime = (recipientId && lastSeenMap?.[recipientId]) || recipient?.lastActiveAt;
                const activeStatusText = formatActiveStatus(isOnline, lastActiveTime);

                return (
                  <div className="p-3.5 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/40">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setActiveConv(null)}
                        className="sm:hidden text-xs text-pink-500 font-bold"
                      >
                        ← Back
                      </button>
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-xs uppercase overflow-hidden">
                          {recipient?.avatarUrl ? (
                            <img src={recipient.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            recipient?.username?.charAt(0) || 'U'
                          )}
                        </div>
                        {isOnline && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-neutral-900 rounded-full" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-neutral-100 flex items-center gap-1">
                          <span>{recipient?.username}</span>
                          {recipient?.isVerified && <span className="text-sky-400 text-[10px]">✓</span>}
                        </p>
                        <p className={`text-[10px] font-normal transition-colors ${
                          isOnline ? 'text-emerald-400 font-medium' : 'text-neutral-400'
                        }`}>
                          {activeStatusText}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-0.5 no-scrollbar bg-black">
                {loadingMsgs ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-neutral-500 animate-spin" />
                  </div>
                ) : (
                  messages.map((m, idx) => {
                    const currentUserId = (user?._id || user?.id)?.toString();
                    const senderId = (m.sender?._id || m.sender?.id || m.sender)?.toString();
                    const isSelf = senderId === currentUserId;

                    const prevMsg = messages[idx - 1];
                    const nextMsg = messages[idx + 1];

                    const prevSender = prevMsg ? (prevMsg.sender?._id || prevMsg.sender?.id || prevMsg.sender)?.toString() : null;
                    const nextSender = nextMsg ? (nextMsg.sender?._id || nextMsg.sender?.id || nextMsg.sender)?.toString() : null;

                    const isSameSenderAsPrev = prevSender === senderId;
                    const isSameSenderAsNext = nextSender === senderId;

                    const recipient = getRecipient(activeConv);
                    const otherUserId = recipient ? (recipient._id || recipient.id)?.toString() : null;

                    return (
                      <div
                        key={m._id || `m-${idx}`}
                        className={`flex items-end gap-2 ${isSelf ? 'justify-end' : 'justify-start'} ${
                          isSameSenderAsPrev ? 'mt-0.5' : 'mt-2.5'
                        }`}
                      >
                        <div className="relative max-w-[70%] sm:max-w-[65%] flex flex-col">
                          <div
                            className={`px-4 py-2 text-[14px] leading-5 select-text break-words rounded-[20px] ${
                              isSelf
                                ? 'bg-gradient-to-r from-[#7000ff] via-[#9400d3] to-[#c800ff] text-white rounded-br-[4px]'
                                : 'bg-[#262626] text-white rounded-bl-[4px]'
                            }`}
                            title={new Date(m.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                          >
                            {/* Story Reply Context Quote */}
                            {m.storyReply?.mediaUrl && (
                              <div className="mb-2 p-2 rounded-xl bg-black/30 border border-white/10 flex items-center gap-2">
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-black/50 shrink-0">
                                  {m.storyReply.mediaType === 'video' ? (
                                    <video src={m.storyReply.mediaUrl} className="w-full h-full object-cover" />
                                  ) : (
                                    <img src={m.storyReply.mediaUrl} alt="" className="w-full h-full object-cover" />
                                  )}
                                </div>
                                <span className="text-[11px] text-white/80 italic">Replied to story</span>
                              </div>
                            )}

                            {/* Note Reply Context Quote */}
                            {m.noteReply?.text && (
                              <div className="mb-2 p-2 rounded-xl bg-black/30 border border-white/10 flex items-center gap-2">
                                <span className="text-[11px] text-white/80 italic">Replied to note: "{m.noteReply.text}"</span>
                              </div>
                            )}

                            {m.mediaUrl && (
                              <div className="mb-1.5 rounded-xl overflow-hidden bg-black/40">
                                <img src={m.mediaUrl} alt="" className="max-h-60 w-auto object-cover rounded-lg" />
                              </div>
                            )}
                            <p className={`${m.text === '❤️' ? 'text-2xl py-0.5' : ''}`}>{m.text}</p>
                          </div>

                          {/* Full Status Lifecycle & Read Receipts */}
                          {(() => {
                            const isLastSentMessage = isSelf && (
                              idx === messages.length - 1 ||
                              messages.slice(idx + 1).every((nextM) => {
                                const nextSenderId = (nextM.sender?._id || nextM.sender?.id || nextM.sender)?.toString();
                                return nextSenderId !== currentUserId;
                              })
                            );

                            if (!isLastSentMessage) return null;

                            // 1. Failed send state with Retry button
                            if (m.status === 'failed') {
                              return (
                                <div className="flex items-center justify-end gap-1.5 mt-1 pr-1 text-right select-none animate-fadeIn">
                                  <span className="text-[11px] text-rose-500 font-medium">Failed to send.</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRetryMessage(m)}
                                    className="text-[11px] text-rose-400 font-semibold underline hover:text-rose-300 transition cursor-pointer"
                                  >
                                    Retry
                                  </button>
                                </div>
                              );
                            }

                            // 2. Sending... (pending server confirmation)
                            if (m.status === 'sending') {
                              return (
                                <div className="flex items-center justify-end gap-1 mt-1 pr-1 text-right select-none animate-pulse">
                                  <span className="text-[11px] text-neutral-500 font-normal">Sending…</span>
                                </div>
                              );
                            }

                            // 3. Seen state: recipient opened conversation
                            const recipientRead = m.readBy && m.readBy.find((r) => {
                              const rId = (r.user?._id || r.user?.id || r.user)?.toString();
                              return rId && otherUserId && rId === otherUserId;
                            });

                            if (recipientRead) {
                              return (
                                <div className="flex items-center justify-end gap-1.5 mt-1 pr-1 text-right select-none animate-fadeIn">
                                  <span className="text-[11px] text-neutral-400 font-normal">
                                    {recipientRead.readAt ? `Seen ${formatSeenTime(recipientRead.readAt)}` : 'Seen'}
                                  </span>
                                  {recipient?.avatarUrl ? (
                                    <img
                                      src={recipient.avatarUrl}
                                      alt=""
                                      className="w-3.5 h-3.5 rounded-full object-cover border border-neutral-700 shrink-0"
                                    />
                                  ) : (
                                    <div className="w-3.5 h-3.5 rounded-full bg-neutral-700 flex items-center justify-center text-[8px] text-white shrink-0">
                                      {recipient?.username?.[0]?.toUpperCase()}
                                    </div>
                                  )}
                                </div>
                              );
                            }

                            // 4. Delivered state: recipient client received message
                            const isDelivered = m.deliveredTo && m.deliveredTo.some((d) => {
                              const dId = (d.user?._id || d.user?.id || d.user)?.toString();
                              return dId && otherUserId && dId === otherUserId;
                            });

                            if (isDelivered) {
                              return (
                                <div className="flex items-center justify-end gap-1 mt-1 pr-1 text-right select-none animate-fadeIn">
                                  <span className="text-[11px] text-neutral-500 font-normal">Delivered</span>
                                </div>
                              );
                            }

                            // 5. Sent state: durably saved on server
                            return (
                              <div className="flex items-center justify-end gap-1 mt-1 pr-1 text-right select-none">
                                <span className="text-[11px] text-neutral-500 font-normal">Sent</span>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Typing indicator bubble */}
                {typingUser && (
                  <div className="flex items-end gap-2 mt-2 pl-1 animate-fadeIn select-none">
                    <div className="w-7 h-7 rounded-full bg-neutral-800 overflow-hidden border border-neutral-700 shrink-0 mb-0.5">
                      {getRecipient(activeConv)?.avatarUrl ? (
                        <img src={getRecipient(activeConv).avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-[10px] text-white">
                          {getRecipient(activeConv)?.username?.[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="bg-[#262626] px-4 py-2.5 rounded-[18px] rounded-bl-[4px] flex items-center gap-1.5 shadow-sm">
                      <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Instagram Style Input Bar */}
              <div className="p-3 bg-black border-t border-neutral-800/80">
                <form onSubmit={handleSendMessage} className="w-full min-h-[44px] bg-[#262626] border border-neutral-700/60 rounded-full px-4 py-1.5 flex items-center gap-3 focus-within:border-neutral-500 transition">
                  <button
                    type="button"
                    onClick={() => setMessageText((prev) => prev + ' 😊')}
                    className="text-white/80 hover:text-white transition cursor-pointer shrink-0"
                    title="Emoji"
                  >
                    <Smile className="w-6 h-6 stroke-[1.8]" />
                  </button>

                  <input
                    type="text"
                    value={messageText}
                    onChange={handleInputChange}
                    placeholder="Message..."
                    maxLength={1000}
                    className="flex-1 bg-transparent border-none text-white text-[14px] placeholder:text-neutral-500 focus:outline-none min-w-0 py-1"
                  />

                  {messageText.trim() ? (
                    <button
                      type="submit"
                      className="text-[#0095f6] hover:text-white font-semibold text-[14px] px-1 cursor-pointer transition shrink-0"
                    >
                      Send
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 text-white/80">
                      <button
                        type="button"
                        onClick={async () => {
                          if (!activeConv) return;
                          try {
                            const res = await api.post(`/conversations/${activeConv._id}/messages`, { text: '❤️' });
                            if (res.data?.success && res.data.message) {
                              setMessages((prev) => prev.some((m) => m._id === res.data.message._id) ? prev : [...prev, res.data.message]);
                            }
                          } catch {}
                        }}
                        className="hover:text-red-500 active:scale-125 transition-transform cursor-pointer shrink-0"
                        title="Send heart"
                      >
                        <Heart className="w-5 h-5 stroke-[1.8] hover:fill-red-500 hover:text-red-500 transition-colors" />
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
              <h3 className="text-sm font-bold text-neutral-100">New Message</h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="text-xs text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
            </div>

            <div className="p-3 border-b border-neutral-800">
              <input
                type="text"
                value={searchUserQuery}
                onChange={(e) => setSearchUserQuery(e.target.value)}
                placeholder="Search username..."
                autoFocus
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-pink-500 transition"
              />
            </div>

            <div className="max-h-60 overflow-y-auto divide-y divide-neutral-800/40 p-2">
              {userSearchResults.length === 0 ? (
                <div className="p-6 text-center text-xs text-neutral-500">
                  {searchUserQuery ? 'No accounts found' : 'Type to search for someone to message'}
                </div>
              ) : (
                userSearchResults.map((u) => (
                  <div
                    key={u._id}
                    onClick={() => handleStartChat(u)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-neutral-800/70 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-xs uppercase overflow-hidden">
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          u.username?.charAt(0) || 'U'
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-neutral-100">{u.username}</p>
                        <p className="text-[10px] text-neutral-400">{u.fullName}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-pink-500">Chat</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
