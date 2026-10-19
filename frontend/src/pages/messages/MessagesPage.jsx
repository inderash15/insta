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
  Phone, 
  Video 
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import DirectNav from '../../components/messages/DirectNav';

export default function MessagesPage() {
  const { user } = useAuth();
  const { socket, onlineUserIds, setUnreadMessages } = useSocket();
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
    }
  };

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = ({ conversationId, message }) => {
      if (activeConv && activeConv._id === conversationId) {
        setMessages((prev) => [...prev, message]);
        api.post(`/conversations/${conversationId}/read`).catch(() => {});
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
    socket.on('typing_start', handleTypingStart);
    socket.on('typing_stop', handleTypingStop);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('typing_start', handleTypingStart);
      socket.off('typing_stop', handleTypingStop);
    };
  }, [socket, activeConv]);

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

  // Send message
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

    try {
      const res = await api.post(`/conversations/${activeConv._id}/messages`, {
        text: textToSend
      });
      if (res.data?.success) {
        setMessages((prev) => [...prev, res.data.message]);
      }
    } catch (err) {
      alert(err.message || 'Failed to send message');
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
                const isOnline = recipient && onlineUserIds.has(recipient._id?.toString() || recipient.id?.toString());
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
                          {recipient?.isVerified && <span className="text-blue-400 text-[10px]">✓</span>}
                        </p>
                        <p className="text-[10px] text-neutral-400">
                          {isOnline ? 'Active now' : 'Offline'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingMsgs ? (
                  <div className="py-12 flex justify-center">
                    <Loader2 className="w-6 h-6 text-pink-500 animate-spin" />
                  </div>
                ) : (
                  messages.map((m) => {
                    const isSelf = (m.sender?._id || m.sender?.id) === (user?._id || user?.id);
                    return (
                      <div
                        key={m._id}
                        className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs ${
                            isSelf
                              ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-br-sm'
                              : 'bg-neutral-800 text-neutral-200 rounded-bl-sm'
                          }`}
                        >
                          {m.mediaUrl && (
                            <div className="mb-2 rounded-lg overflow-hidden">
                              <img src={m.mediaUrl} alt="" className="max-h-60 w-auto object-cover" />
                            </div>
                          )}
                          <p className="leading-relaxed">{m.text}</p>
                        </div>
                        <span className="text-[9px] text-neutral-500 mt-1 px-1">
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                )}

                {/* Typing indicator */}
                {typingUser && (
                  <div className="text-[11px] text-neutral-400 italic flex items-center gap-1.5 pl-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-bounce" />
                    <span>{typingUser} is typing...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-neutral-800 bg-neutral-900/60 flex items-center gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={handleInputChange}
                  placeholder="Message..."
                  maxLength={1000}
                  className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-pink-500 transition"
                />
                <button
                  type="submit"
                  disabled={!messageText.trim()}
                  className="p-2.5 rounded-xl text-white insta-story-gradient hover:opacity-90 active:scale-95 transition disabled:opacity-30 disabled:cursor-not-allowed shadow-md shadow-pink-500/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
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
