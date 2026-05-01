import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowLeft,
  FiBookmark,
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
  FiEdit2,
  FiMapPin,
  FiMessageCircle,
  FiPhone,
  FiTrash2,
} from 'react-icons/fi';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import {
  FALLBACK_IMAGE,
  buildOpenStreetMapEmbedUrl,
  formatCurrency,
} from '../utils/listings';

export default function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [saved, setSaved] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [messageDraft, setMessageDraft] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [message, setMessage] = useState('');

  const images = useMemo(
    () => (listing?.images?.length ? listing.images : [FALLBACK_IMAGE]),
    [listing],
  );
  const isOwner = Boolean(user && listing?.landlordId?._id === user.id);

  useEffect(() => {
    loadListing();
  }, [id]);

  useEffect(() => {
    if (user && listing) checkIfSaved();
  }, [user, listing?._id]);

  const loadListing = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/listings/${id}`);
      setListing(data);
      setCurrentImageIndex(0);
    } catch (err) {
      console.error('Error loading listing:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkIfSaved = async () => {
    try {
      const { data } = await api.get('/user/saved');
      setSaved(data.some((item) => item?._id === listing._id));
    } catch (err) {
      console.error('Error checking saved status:', err);
    }
  };

  const toggleSave = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const { data } = await api.post(`/listings/${id}/save`);
      setSaved(data.saved);
    } catch (err) {
      console.error('Error toggling save:', err);
    }
  };

  const handleContactClick = () => {
    if (!user) {
      setMessage('Please log in to view the landlord contact number.');
      return;
    }

    setShowPhone(true);
  };

  const startConversation = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'tenant') {
      setMessage('Only tenants can start a new conversation from a listing.');
      return;
    }

    if (!messageDraft.trim()) {
      setMessage('Write a short message to the landlord first.');
      return;
    }

    setSendingMessage(true);
    setMessage('');

    try {
      const { data } = await api.post('/messages/conversations', {
        listingId: id,
        body: messageDraft,
      });
      navigate(`/messages?conversation=${data.conversation._id}`);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const deleteListing = async () => {
    if (!window.confirm('Delete this listing permanently?')) return;

    try {
      await api.delete(`/listings/${id}`);
      navigate('/dashboard');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not delete listing');
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((index) => (index + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((index) => (index === 0 ? images.length - 1 : index - 1));
  };

  if (loading) {
    return (
      <div className="page-bg flex min-h-screen items-center justify-center bg-navy">
        <div className="spinner" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="page-bg flex min-h-screen items-center justify-center bg-navy px-4">
        <div className="glass max-w-md p-8 text-center">
          <h1 className="mb-4 text-2xl font-bold">Listing not found</h1>
          <Link to="/browse" className="inline-block rounded-lg bg-indigo-600 px-6 py-3 font-semibold hover:bg-indigo-500">
            Back to browse
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-bg min-h-screen bg-navy">
      <button
        type="button"
        onClick={() => navigate('/browse')}
        className="glass fixed left-4 top-4 z-40 p-3 hover:bg-white/10"
        aria-label="Back to browse"
        title="Back to browse"
      >
        <FiArrowLeft size={22} />
      </button>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <section>
            <div className="glass mb-8 overflow-hidden">
              <div className="relative bg-black/30">
                <img
                  src={images[currentImageIndex]}
                  alt={listing.title}
                  className="h-[26rem] w-full object-cover"
                />

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prevImage}
                      className="glass absolute left-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white/20"
                      aria-label="Previous photo"
                      title="Previous photo"
                    >
                      <FiChevronLeft size={24} />
                    </button>
                    <button
                      type="button"
                      onClick={nextImage}
                      className="glass absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white/20"
                      aria-label="Next photo"
                      title="Next photo"
                    >
                      <FiChevronRight size={24} />
                    </button>
                    <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                      {images.map((image, index) => (
                        <button
                          type="button"
                          key={image}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`h-2 rounded-full ${
                            index === currentImageIndex ? 'w-7 bg-white' : 'w-2 bg-white/40'
                          }`}
                          aria-label={`Show photo ${index + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <section className="glass mb-8 p-6">
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
                {listing.type} in {listing.city}
              </p>
              <h1 className="mb-3 text-4xl font-bold">{listing.title}</h1>

              <div className="mb-6 flex items-center gap-2 text-slate-300">
                <FiMapPin size={18} />
                <span>
                  {listing.locality}, {listing.city}
                </span>
              </div>

              <p className="mb-6 leading-7 text-slate-300">{listing.description}</p>

              <div className="mb-6 grid gap-4 sm:grid-cols-2">
                <div className="detail-tile">
                  <p>Room type</p>
                  <strong className="text-indigo-300">{listing.type}</strong>
                </div>
                <div className="detail-tile">
                  <p>Gender preference</p>
                  <strong className="text-emerald-300">{listing.genderPreference}</strong>
                </div>
                <div className="detail-tile">
                  <p>Available from</p>
                  <strong>{new Date(listing.availableFrom).toLocaleDateString()}</strong>
                </div>
                <div className="detail-tile">
                  <p>Views</p>
                  <strong>{listing.views}</strong>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="mb-3 text-xl font-semibold">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {(listing.amenities || []).map((amenity) => (
                    <span key={amenity} className="badge badge-indigo">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              {listing.address && (
                <div className="detail-tile">
                  <p>Address</p>
                  <strong>{listing.address}</strong>
                </div>
              )}
            </section>

            <section className="glass overflow-hidden p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold">Approximate location</h2>
                <span className="text-sm text-slate-400">
                  {listing.locality}, {listing.city}
                </span>
              </div>
              <iframe
                title={`Map for ${listing.title}`}
                src={buildOpenStreetMapEmbedUrl(listing)}
                className="h-80 w-full rounded-lg border-0"
                loading="lazy"
              />
            </section>
          </section>

          <aside>
            <div className="glass sticky top-8 p-6">
              <p className="mb-1 text-slate-400">Monthly rent</p>
              <p className="mb-6 text-5xl font-bold text-emerald-300">
                {formatCurrency(listing.rent)}
              </p>

              {message && <div className="mb-4 rounded-lg bg-indigo-500/15 p-3 text-sm text-indigo-100">{message}</div>}

              <div className="space-y-3">
                {isOwner ? (
                  <>
                    <Link
                      to={`/listings/${id}/edit`}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 font-semibold hover:bg-indigo-500"
                    >
                      <FiEdit2 /> Edit listing
                    </Link>
                    <button
                      type="button"
                      onClick={deleteListing}
                      className="glass flex w-full items-center justify-center gap-2 py-3 font-semibold text-red-300 hover:bg-red-500/20"
                    >
                      <FiTrash2 /> Delete listing
                    </button>
                  </>
                ) : (
                  <>
                    {!showPhone ? (
                      <button
                        type="button"
                        onClick={handleContactClick}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 font-semibold hover:bg-indigo-500"
                      >
                        <FiPhone size={18} /> View contact
                      </button>
                    ) : (
                      <div className="rounded-lg border border-emerald-400/40 bg-emerald-500/15 p-4 text-center">
                        <p className="mb-2 text-sm text-slate-300">Contact number</p>
                        <p className="font-mono text-2xl font-bold text-emerald-300">
                          {listing.contactNumber}
                        </p>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={toggleSave}
                      className={`flex w-full items-center justify-center gap-2 rounded-lg py-3 font-semibold ${
                        saved ? 'bg-emerald-600 hover:bg-emerald-500' : 'glass hover:bg-white/10'
                      }`}
                    >
                      {saved ? <FiCheckCircle size={18} /> : <FiBookmark size={18} />}
                      {saved ? 'Saved' : 'Save listing'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (!user) navigate('/login');
                        else setShowMessageBox((value) => !value);
                      }}
                      className="glass flex w-full items-center justify-center gap-2 py-3 font-semibold hover:bg-white/10"
                    >
                      <FiMessageCircle size={18} /> Message landlord
                    </button>

                    {showMessageBox && (
                      <form onSubmit={startConversation} className="space-y-3 rounded-lg bg-white/5 p-3">
                        <textarea
                          value={messageDraft}
                          onChange={(event) => setMessageDraft(event.target.value)}
                          rows="4"
                          placeholder="Hi, I am interested in this room. Is it available for a visit?"
                        />
                        <button
                          type="submit"
                          disabled={sendingMessage || !messageDraft.trim()}
                          className="w-full rounded-lg bg-emerald-600 py-3 font-semibold hover:bg-emerald-500 disabled:opacity-60"
                        >
                          {sendingMessage ? 'Sending...' : 'Send message'}
                        </button>
                      </form>
                    )}
                  </>
                )}
              </div>

              <div className="glass mt-6 p-4">
                <p className="mb-2 text-sm text-slate-400">Posted by</p>
                <p className="font-semibold">{listing.landlordId?.name || 'Landlord'}</p>
                <p className="mt-2 text-sm text-slate-400">
                  Posted {new Date(listing.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </aside>
        </motion.div>
      </main>
    </div>
  );
}
