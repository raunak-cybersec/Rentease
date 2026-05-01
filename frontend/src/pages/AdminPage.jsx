import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiMessageCircle, FiTrash2, FiUsers } from 'react-icons/fi';
import api from '../utils/api';
import { formatCurrency } from '../utils/listings';

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [tab, setTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, listingsRes, conversationsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/listings'),
        api.get('/admin/conversations'),
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setListings(listingsRes.data);
      setConversations(conversationsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load admin panel');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Delete this user and their related data?')) return;

    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers((current) => current.filter((user) => user._id !== userId));
      await loadAdminData();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete user');
    }
  };

  const deleteListing = async (listingId) => {
    if (!window.confirm('Delete this listing?')) return;

    try {
      await api.delete(`/admin/listings/${listingId}`);
      setListings((current) => current.filter((listing) => listing._id !== listingId));
      await loadAdminData();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete listing');
    }
  };

  const statCards = [
    { label: 'Users', value: stats?.users || 0, icon: FiUsers },
    { label: 'Listings', value: stats?.listings || 0, icon: FiHome },
    { label: 'Conversations', value: stats?.conversations || 0, icon: FiMessageCircle },
    { label: 'Messages', value: stats?.messages || 0, icon: FiMessageCircle },
  ];

  return (
    <div className="page-bg min-h-screen bg-navy">
      <nav className="glass fixed top-0 z-50 w-full border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-2xl font-bold text-indigo-300">
            RentEase Admin
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

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-24">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Platform control
          </p>
          <h1 className="text-4xl font-bold">Admin Panel</h1>
        </div>

        {error && <div className="mb-5 rounded-lg bg-red-500/15 p-4 text-red-200">{error}</div>}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="spinner" />
          </div>
        ) : (
          <>
            <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {statCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className="glass p-5">
                    <Icon className="mb-4 text-indigo-300" size={24} />
                    <p className="text-sm text-slate-400">{card.label}</p>
                    <p className="mt-1 text-3xl font-bold">{card.value}</p>
                  </div>
                );
              })}
            </section>

            <div className="mb-5 flex flex-wrap gap-2">
              {['users', 'listings', 'conversations'].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTab(item)}
                  className={`pill-button capitalize ${tab === item ? 'pill-button-active' : ''}`}
                >
                  {item}
                </button>
              ))}
            </div>

            {tab === 'users' && (
              <section className="glass overflow-hidden">
                {users.map((user) => (
                  <div key={user._id} className="grid gap-3 border-b border-white/10 p-4 md:grid-cols-[1fr_130px_180px_auto] md:items-center">
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-slate-400">{user.email}</p>
                    </div>
                    <span className="badge badge-indigo w-fit capitalize">{user.role}</span>
                    <p className="text-sm text-slate-400">
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                    <button
                      type="button"
                      onClick={() => deleteUser(user._id)}
                      className="glass flex items-center justify-center gap-2 px-4 py-2 font-semibold text-red-300 hover:bg-red-500/20 disabled:opacity-40"
                      disabled={user.role === 'admin'}
                      title={user.role === 'admin' ? 'Admin accounts are protected here' : 'Delete user'}
                    >
                      <FiTrash2 /> Delete
                    </button>
                  </div>
                ))}
              </section>
            )}

            {tab === 'listings' && (
              <section className="glass overflow-hidden">
                {listings.map((listing) => (
                  <div key={listing._id} className="grid gap-3 border-b border-white/10 p-4 lg:grid-cols-[1fr_160px_180px_auto] lg:items-center">
                    <div>
                      <Link to={`/listings/${listing._id}`} className="font-semibold hover:text-indigo-300">
                        {listing.title}
                      </Link>
                      <p className="text-sm text-slate-400">
                        {listing.locality}, {listing.city} by {listing.landlordId?.name || 'Unknown'}
                      </p>
                    </div>
                    <p className="font-semibold text-emerald-300">{formatCurrency(listing.rent)}</p>
                    <p className="text-sm text-slate-400">{listing.views} views</p>
                    <button
                      type="button"
                      onClick={() => deleteListing(listing._id)}
                      className="glass flex items-center justify-center gap-2 px-4 py-2 font-semibold text-red-300 hover:bg-red-500/20"
                    >
                      <FiTrash2 /> Delete
                    </button>
                  </div>
                ))}
              </section>
            )}

            {tab === 'conversations' && (
              <section className="glass overflow-hidden">
                {conversations.map((conversation) => (
                  <div key={conversation._id} className="border-b border-white/10 p-4">
                    <p className="font-semibold">{conversation.listingId?.title || 'Deleted listing'}</p>
                    <p className="text-sm text-slate-400">
                      Tenant: {conversation.tenantId?.name} · Landlord: {conversation.landlordId?.name}
                    </p>
                    <p className="mt-2 text-slate-300">{conversation.lastMessage}</p>
                  </div>
                ))}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
