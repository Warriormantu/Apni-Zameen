import { useEffect, useState } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
  </svg>
);

const PaperclipIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const MessagesPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [reply, setReply] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const loadMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/messages');
      setMessages(response.data.data.items || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMessages(); }, []);

  const filtered = messages.filter((m) => {
    if (!searchQuery) return true;
    const other = m.sender?._id === user?._id ? m.receiver : m.sender;
    return (
      m.property?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      other?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const activeMessage = filtered[activeIndex];
  const otherUser = activeMessage
    ? activeMessage.sender?._id === user?._id
      ? activeMessage.receiver
      : activeMessage.sender
    : null;

  const activeThread = activeMessage && otherUser
    ? messages
        .filter((m) => {
          const mOther = m.sender?._id === user?._id ? m.receiver : m.sender;
          return m.property?._id === activeMessage.property?._id && mOther?._id === otherUser?._id;
        })
        .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
    : [];

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!reply.trim() || !activeMessage) return;
    const otherUser = activeMessage.sender?._id === user?._id ? activeMessage.receiver : activeMessage.sender;
    if (!otherUser?._id || !activeMessage.property?._id) return;
    try {
      const response = await api.post('/messages', {
        property: activeMessage.property._id,
        receiver: otherUser._id,
        message: reply.trim(),
      });
      const newMsg = {
        ...response.data.data,
        sender: { _id: user?._id, name: user?.name },
        receiver: otherUser,
        property: activeMessage.property,
      };
      setMessages((prev) => [newMsg, ...prev]);
      setActiveIndex(0);
      setReply('');
    } catch {
      // silently ignore
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex h-[calc(100vh-68px)] bg-surface">
      {/* ── Inbox (Left panel) ── */}
      <div className="w-full max-w-xs shrink-0 border-r border-surface-border bg-white flex flex-col">
        {/* Inbox header */}
        <div className="border-b border-surface-border p-4">
          <h1 className="font-playfair text-xl font-bold text-primary">Inbox</h1>
          {/* Search */}
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-surface-border bg-surface px-3 py-2">
            <SearchIcon />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages..."
              className="flex-1 border-0 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="space-y-1 p-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse rounded-lg p-3">
                  <div className="flex gap-3 items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-200 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-24 rounded bg-gray-200" />
                      <div className="h-3 w-40 rounded bg-gray-200" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-400">
              No messages yet.
            </div>
          ) : (
            filtered.map((message, idx) => {
              const otherUser = message.sender?._id === user?._id ? message.receiver : message.sender;
              const isSender = message.sender?._id === user?._id;
              return (
                <button
                  key={message._id}
                  onClick={() => setActiveIndex(idx)}
                  className={`w-full text-left px-4 py-3 border-b border-surface-border transition hover:bg-surface ${idx === activeIndex ? 'bg-surface border-l-2 border-l-amber' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary uppercase">
                      {(otherUser?.name || 'A')[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-sm font-semibold text-primary truncate">{otherUser?.name || 'Agent'}</p>
                        <span className="text-xs text-gray-400 shrink-0">{formatTime(message.createdAt)}</span>
                      </div>
                      {message.property?.title && (
                        <p className="text-xs font-semibold text-amber truncate">{message.property.title}</p>
                      )}
                      <p className="mt-0.5 text-xs text-gray-500 truncate">
                        {isSender ? 'You: ' : ''}{message.message}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Chat Thread (Right panel) ── */}
      <div className="flex flex-1 flex-col min-w-0">
        {!activeMessage ? (
          <div className="flex flex-1 items-center justify-center text-center p-8">
            <div>
              <div className="text-5xl mb-4">💬</div>
              <h3 className="font-playfair text-xl font-bold text-primary">Select a Conversation</h3>
              <p className="mt-2 text-sm text-gray-500">Choose a message from the inbox to view the full thread.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            {(() => {
              const otherUser = activeMessage.sender?._id === user?._id ? activeMessage.receiver : activeMessage.sender;
              return (
                <div className="flex items-center justify-between border-b border-surface-border bg-white px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-white uppercase">
                      {(otherUser?.name || 'A')[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-primary text-sm">{otherUser?.name || 'Agent'}</p>
                      <p className="text-xs text-rera">● Online</p>
                    </div>
                  </div>
                  {/* Property context card */}
                  {activeMessage.property && (
                    <div className="flex items-center gap-3 rounded-lg border border-surface-border bg-surface px-3 py-2">
                      <div className="h-10 w-10 rounded overflow-hidden shrink-0 bg-gray-200">
                        {activeMessage.property.images?.[0] && (
                          <img
                            src={activeMessage.property.images[0].url || activeMessage.property.images[0]}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-primary truncate max-w-[150px]">
                          {activeMessage.property.title}
                        </p>
                        {activeMessage.property.price && (
                          <p className="text-xs text-gray-400">
                            ₹{(activeMessage.property.price / 10000000).toFixed(2)} Cr
                          </p>
                        )}
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {activeThread.map((msg) => (
                <div
                  key={msg._id || Math.random()}
                  className={`flex gap-3 ${msg.sender?._id === user?._id ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className="h-8 w-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary uppercase">
                    {(msg.sender?.name || 'A')[0]}
                  </div>
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm ${
                      msg.sender?._id === user?._id
                        ? 'bg-primary text-white rounded-tr-sm'
                        : 'bg-white shadow-card text-gray-800 rounded-tl-sm'
                    }`}
                  >
                    <p>{msg.message}</p>
                    <p
                      className={`mt-1.5 text-xs ${
                        msg.sender?._id === user?._id ? 'text-white/60' : 'text-gray-400'
                      }`}
                    >
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Compose box */}
            <form onSubmit={handleSendReply} className="border-t border-surface-border bg-white px-4 py-3">
              <div className="flex items-center gap-3">
                <button type="button" className="shrink-0 text-gray-400 hover:text-primary transition">
                  <PaperclipIcon />
                </button>
                <input
                  type="text"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-pill border border-surface-border bg-surface px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!reply.trim()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber text-primary transition hover:bg-amber-dark disabled:opacity-40"
                >
                  <SendIcon />
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
