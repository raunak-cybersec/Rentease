import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiEdit2, FiEye, FiPlus, FiTrash2 } from 'react-icons/fi';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { formatCurrency, getListingImage } from '../utils/listings';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadData();
  }, [user?.role]);

  const loadData = async () => {
    setLoading(true);
    try {
      const endpoint = user?.role === 'landlord' ? '/user/listings' : '/user/saved';
      const { data } = await api.get(endpoint);
      setListings(data.filter(Boolean));
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteListing = async (listingId) => {
    try {
      await api.delete(`/listings/${listingId}`);
      setListings((current) => current.filter((listing) => listing._id !== listingId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting listing:', err);
    }
  };

  const removeSavedListing = async (listingId) => {
    try {
      await api.post(`/listings/${listingId}/save`);
      setListings((current) => current.filter((listing) => listing._id !== listingId));
    } catch (err) {
      console.error('Error removing saved listing:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
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
            {user?.role !== 'admin' && (
              <Link to="/messages" className="hover:text-emerald-300">
                Messages
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin" className="hover:text-emerald-300">
                Admin
              </Link>
            )}
            <button type="button" onClick={handleLogout} className="text-red-300 hover:text-red-200">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-12 pt-24">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
              {user?.role === 'landlord' ? 'Landlord dashboard' : 'Tenant dashboard'}
            </p>
            <h1 className="text-4xl font-bold">
              {user?.role === 'landlord' ? 'My Listings' : 'Saved Listings'}
            </h1>
            <p className="mt-2 text-slate-400">
              Welcome, <span className="font-semibold text-indigo-300">{user?.name}</span>
            </p>
          </div>

          {user?.role === 'landlord' && (
            <Link
              to="/create-listing"
              className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 font-semibold hover:bg-indigo-500"
            >
              <FiPlus /> Create Listing
            </Link>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="spinner" />
          </div>
        ) : listings.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass p-10 text-center">
            <p className="mb-6 text-lg text-slate-300">
              {user?.role === 'landlord'
                ? "You haven't created any listings yet."
                : "You haven't saved any listings yet."}
            </p>
            <Link
              to={user?.role === 'landlord' ? '/create-listing' : '/browse'}
              className="inline-block rounded-lg bg-indigo-600 px-6 py-3 font-semibold hover:bg-indigo-500"
            >
              {user?.role === 'landlord' ? 'Create first listing' : 'Browse listings'}
            </Link>
          </motion.div>
        ) : (
          <section className="grid gap-5">
            {listings.map((listing) => (
              <motion.article
                key={listing._id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass grid gap-5 p-4 sm:grid-cols-[140px_1fr] lg:grid-cols-[150px_1fr_auto]"
              >
                <Link to={`/listings/${listing._id}`} className="block overflow-hidden rounded-lg">
                  <img
                    src={getListingImage(listing)}
                    alt={listing.title}
                    className="h-40 w-full object-cover sm:h-full"
                  />
                </Link>

                <div className="min-w-0">
                  <Link to={`/listings/${listing._id}`} className="hover:text-indigo-300">
                    <h2 className="truncate text-2xl font-bold">{listing.title}</h2>
                  </Link>
                  <p className="mt-2 text-slate-400">
                    {listing.locality}, {listing.city}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div>
                      <p className="text-sm text-slate-500">Rent</p>
                      <p className="font-semibold text-emerald-300">{formatCurrency(listing.rent)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Type</p>
                      <p className="font-semibold">{listing.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Gender</p>
                      <p className="font-semibold">{listing.genderPreference}</p>
                    </div>
                    {user?.role === 'landlord' && (
                      <div>
                        <p className="text-sm text-slate-500">Views</p>
                        <p className="flex items-center gap-1 font-semibold">
                          <FiEye /> {listing.views}
                        </p>
                      </div>
                    )}
                  </div>

                  <p className="mt-4 text-sm text-slate-500">
                    Posted {new Date(listing.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 lg:flex-col lg:justify-center">
                  <Link
                    to={`/listings/${listing._id}`}
                    className="glass px-4 py-2 text-center font-semibold hover:bg-white/10"
                  >
                    View
                  </Link>

                  {user?.role === 'landlord' ? (
                    <>
                      <Link
                        to={`/listings/${listing._id}/edit`}
                        className="glass flex items-center justify-center gap-2 px-4 py-2 font-semibold hover:bg-white/10"
                      >
                        <FiEdit2 size={16} /> Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirm(listing._id)}
                        className="glass flex items-center justify-center gap-2 px-4 py-2 font-semibold text-red-300 hover:bg-red-500/20"
                      >
                        <FiTrash2 size={16} /> Delete
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => removeSavedListing(listing._id)}
                      className="glass px-4 py-2 font-semibold text-red-300 hover:bg-red-500/20"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </motion.article>
            ))}
          </section>
        )}
      </main>

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4">
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="glass max-w-md p-8">
            <h2 className="mb-4 text-2xl font-bold">Delete listing?</h2>
            <p className="mb-6 text-slate-300">
              This removes the listing from search results and from tenant saved lists.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => deleteListing(deleteConfirm)}
                className="flex-1 rounded-lg bg-red-600 py-3 font-semibold hover:bg-red-500"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="glass flex-1 py-3 font-semibold hover:bg-white/10"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
