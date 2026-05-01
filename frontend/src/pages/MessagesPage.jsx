import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiMessageCircle, FiSend } from 'react-icons/fi';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { formatCurrency, getListingImage } from '../utils/listings';

export default function MessagesPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(searchParams.get('conversation') || '');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation._id === selectedId),
    [conversations, selectedId],
  );

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    const paramId = searchParams.get('conversation');
    if (paramId && paramId !== selectedId) setSelectedId(paramId);
  }, [searchParams]);

  useEffect(() => {
    if (selectedId) loadThread(selectedId);
  }, [selectedId]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/messages/conversations');
      setConversations(data);

      const paramId = searchParams.get('conversation');
      const nextSelected = paramId || data[0]?._id || '';
      setSelectedId(nextSelected);
      if (nextSelected) setSearchParams({ conversation: nextSelected }, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load messages');
    } finally {
      setLoading(false);
    }
  };

  const loadThread = async (conversationId) => {
    setThreadLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/messages/conversations/${conversationId}/messages`);
      setMessages(data.messages);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load conversation');
    } finally {
      setThreadLoading(false);
    }
  };

  const selectConversation = (conversationId) => {
    setSelectedId(conversationId);
    setSearchParams({ conversation: conversationId });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!draft.trim() || !selectedId) return;

    try {
      const { data } = await api.post(`/messages/conversations/${selectedId}/messages`, {
        body: draft,
      });
      setMessages((current) => [...current, data]);
      setDraft('');
      setConversations((current) =>
        current.map((conversation) =>
          conversation._id === selectedId
            ? {
                ...conversation,
                lastMessage: data.body,
                lastMessageAt: data.createdAt,
              }
            : conversation,
        ),
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Message failed');
    }
  };

  const getOtherPerson = (conversation) => {
    if (!conversation) return null;
    return user?.role === 'tenant' ? conversation.landlordId : conversation.tenantId;
  };

  return (
    <div className="page-bg min-h-screen bg-navy">
      <nav className="glass fixed top-0 z-50 w-full border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-2xl font-bold text-indigo-300">
            RentEase
          </Link>
          <div className="flex items-center gap-4 text-sm sm:text-base">
            <Link to="/browse" className="hover:text-emerald-300">
              Browse
            </Link>
            <Link to="/dashboard" className="hover:text-emerald-300">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-10 pt-24">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Inbox
          </p>
          <h1 className="text-4xl font-bold">Messages</h1>
        </div>

        {error && <div className="mb-5 rounded-lg bg-red-500/15 p-4 text-red-200">{error}</div>}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="spinner" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="glass p-10 text-center">
            <FiMessageCircle className="mx-auto mb-4 text-indigo-300" size={42} />
            <p className="text-lg text-slate-300">
              {user?.role === 'tenant'
                ? 'Start a conversation from any listing page.'
                : 'Tenant conversations will appear here.'}
            </p>
          </div>
        ) : (
          <section className="grid gap-5 lg:grid-cols-[360px_1fr]">
            <aside className="glass overflow-hidden">
              {conversations.map((conversation) => {
                const otherPerson = getOtherPerson(conversation);
                const isSelected = conversation._id === selectedId;

                return (
                  <button
                    type="button"
                    key={conversation._id}
                    onClick={() => selectConversation(conversation._id)}
                    className={`flex w-full gap-3 border-b border-white/10 p-4 text-left hover:bg-white/10 ${
                      isSelected ? 'bg-indigo-500/15' : ''
                    }`}
                  >
                    <img
                      src={getListingImage(conversation.listingId)}
                      alt={conversation.listingId?.title}
                      className="h-16 w-16 flex-shrink-0 rounded-lg object-cover"
                    />
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{otherPerson?.name}</span>
                      <span className="block truncate text-sm text-slate-400">
                        {conversation.listingId?.title}
                      </span>
                      <span className="mt-1 block truncate text-sm text-slate-300">
                        {conversation.lastMessage || 'No messages yet'}
                      </span>
                    </span>
                  </button>
                );
              })}
            </aside>

            <section className="glass flex min-h-[620px] flex-col overflow-hidden">
              {selectedConversation && (
                <header className="border-b border-white/10 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold">{getOtherPerson(selectedConversation)?.name}</h2>
                      <Link
                        to={`/listings/${selectedConversation.listingId?._id}`}
                        className="text-sm text-indigo-300 hover:text-indigo-200"
                      >
                        {selectedConversation.listingId?.title}
                      </Link>
                    </div>
                    <p className="hidden text-right text-sm text-slate-400 sm:block">
                      {selectedConversation.listingId?.locality}, {selectedConversation.listingId?.city}
                      <br />
                      {formatCurrency(selectedConversation.listingId?.rent)}
                    </p>
                  </div>
                </header>
              )}

              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {threadLoading ? (
                  <div className="flex justify-center py-20">
                    <div className="spinner" />
                  </div>
                ) : (
                  messages.map((message) => {
                    const mine = message.senderId?._id === user?.id;
                    return (
                      <div key={message._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[78%] rounded-lg px-4 py-3 ${
                            mine ? 'bg-indigo-600 text-white' : 'bg-white/10 text-slate-100'
                          }`}
                        >
                          <p className="whitespace-pre-wrap leading-6">{message.body}</p>
                          <p className={`mt-2 text-xs ${mine ? 'text-indigo-100' : 'text-slate-500'}`}>
                            {new Date(message.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <form onSubmit={sendMessage} className="grid gap-3 border-t border-white/10 p-4 sm:grid-cols-[1fr_auto]">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Write a reply..."
                  disabled={!selectedId}
                />
                <button
                  type="submit"
                  disabled={!draft.trim() || !selectedId}
                  className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 font-semibold hover:bg-indigo-500 disabled:opacity-60"
                >
                  <FiSend /> Send
                </button>
              </form>
            </section>
          </section>
        )}
      </main>
    </div>
  );
}
