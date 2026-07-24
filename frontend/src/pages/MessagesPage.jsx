import { useEffect, useState } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const MessagesPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    loadMessages();
  }, []);

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Messages</h1>
        <p className="mt-3 text-slate-600">Review recent conversations and leads.</p>
      </div>

      {error && <div className="rounded-3xl bg-rose-50 p-6 text-sm text-rose-700">{error}</div>}

      {loading ? (
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm">Loading messages...</div>
      ) : messages.length === 0 ? (
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm">No messages yet.</div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => {
            const otherUser = message.sender?._id === user._id ? message.receiver : message.sender;
            return (
              <div key={message._id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">{message.property?.title || 'Property'}</h2>
                    <p className="mt-2 text-slate-600">With: {otherUser?.name || 'Unknown'}</p>
                    <p className="mt-1 text-sm text-slate-500">{new Date(message.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-900">
                    {message.sender?._id === user._id ? 'Sent' : 'Received'}
                  </div>
                </div>
                <p className="mt-4 text-slate-700">{message.message}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
