import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiImage, FiTrash2 } from 'react-icons/fi';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { AMENITIES, CITIES, ROOM_TYPES, readImagesAsDataUrls } from '../utils/listings';

const RENT_MIN = 100;
const RENT_MAX = 1000000;
const RENT_STEP = 100;

const emptyForm = {
  title: '',
  description: '',
  rent: '',
  city: '',
  locality: '',
  address: '',
  type: '',
  genderPreference: 'Any',
  amenities: [],
  images: [],
  availableFrom: '',
  contactNumber: '',
};

export default function CreateListingPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [loadingListing, setLoadingListing] = useState(isEditing);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (!isEditing) return;

    const loadListing = async () => {
      setLoadingListing(true);
      try {
        const { data } = await api.get(`/listings/${id}`);

        setFormData({
          title: data.title || '',
          description: data.description || '',
          rent: data.rent || '',
          city: data.city || '',
          locality: data.locality || '',
          address: data.address || '',
          type: data.type || '',
          genderPreference: data.genderPreference || 'Any',
          amenities: data.amenities || [],
          images: data.images || [],
          availableFrom: data.availableFrom ? data.availableFrom.slice(0, 10) : '',
          contactNumber: data.contactNumber || '',
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load listing');
      } finally {
        setLoadingListing(false);
      }
    };

    loadListing();
  }, [id, isEditing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const toggleAmenity = (amenity) => {
    setFormData((current) => {
      const amenities = current.amenities.includes(amenity)
        ? current.amenities.filter((item) => item !== amenity)
        : [...current.amenities, amenity];

      return { ...current, amenities };
    });
  };

  const handleImageInput = async (e) => {
    setError('');
    try {
      const imageUrls = await readImagesAsDataUrls(e.target.files);
      setFormData((current) => ({
        ...current,
        images: [...current.images, ...imageUrls].slice(0, 5),
      }));
      e.target.value = '';
    } catch {
      setError('Could not read one or more selected images');
    }
  };

  const removeImage = (index) => {
    setFormData((current) => ({
      ...current,
      images: current.images.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        rent: Number(formData.rent),
        images: formData.images.slice(0, 5),
      };

      const { data } = isEditing
        ? await api.put(`/listings/${id}`, payload)
        : await api.post('/listings', payload);

      navigate(`/listings/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} listing`);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'landlord') {
    return (
      <div className="page-bg flex min-h-screen items-center justify-center bg-navy px-4">
        <div className="glass max-w-md p-8 text-center">
          <h1 className="mb-4 text-2xl font-bold">Access denied</h1>
          <p className="mb-6 text-slate-300">Only landlords can create and manage listings.</p>
          <Link to="/browse" className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold hover:bg-indigo-500">
            Browse listings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-bg min-h-screen bg-navy">
      <main className="relative z-10 mx-auto max-w-4xl px-4 py-8">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="mb-6 flex items-center gap-2 text-indigo-300 hover:text-indigo-200"
        >
          <FiArrowLeft /> Back to dashboard
        </button>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-6 sm:p-8">
          <div className="mb-8">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
              Landlord tools
            </p>
            <h1 className="text-4xl font-bold">
              {isEditing ? 'Edit listing' : 'Create new listing'}
            </h1>
          </div>

          {error && <div className="mb-6 rounded-lg bg-red-500/15 p-4 text-red-200">{error}</div>}

          {loadingListing ? (
            <div className="flex justify-center py-20">
              <div className="spinner" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <label>
                  <span className="mb-2 block text-sm font-semibold text-slate-300">Title</span>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Spacious PG in Bandra West"
                    required
                  />
                </label>
                <label>
                  <span className="mb-2 block text-sm font-semibold text-slate-300">
                    Monthly rent
                  </span>
                  <input
                    type="number"
                    name="rent"
                    min={RENT_MIN}
                    max={RENT_MAX}
                    step={RENT_STEP}
                    value={formData.rent}
                    onChange={handleInputChange}
                    placeholder="12000"
                    required
                  />
                </label>
              </div>

              <label>
                <span className="mb-2 block text-sm font-semibold text-slate-300">Description</span>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the space, rules, nearby transit, and included services"
                  rows="4"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-3">
                <label>
                  <span className="mb-2 block text-sm font-semibold text-slate-300">City</span>
                  <select name="city" value={formData.city} onChange={handleInputChange} required>
                    <option value="">Select city</option>
                    {CITIES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="mb-2 block text-sm font-semibold text-slate-300">Locality</span>
                  <input
                    type="text"
                    name="locality"
                    value={formData.locality}
                    onChange={handleInputChange}
                    placeholder="Koramangala"
                    required
                  />
                </label>
                <label>
                  <span className="mb-2 block text-sm font-semibold text-slate-300">Address</span>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Street, landmark"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <label>
                  <span className="mb-2 block text-sm font-semibold text-slate-300">Room type</span>
                  <select name="type" value={formData.type} onChange={handleInputChange} required>
                    <option value="">Select type</option>
                    {ROOM_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="mb-2 block text-sm font-semibold text-slate-300">
                    Gender preference
                  </span>
                  <select
                    name="genderPreference"
                    value={formData.genderPreference}
                    onChange={handleInputChange}
                  >
                    <option value="Any">Any</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </label>
                <label>
                  <span className="mb-2 block text-sm font-semibold text-slate-300">
                    Contact number
                  </span>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    placeholder="+91 98765 43210"
                    required
                  />
                </label>
              </div>

              <label>
                <span className="mb-2 block text-sm font-semibold text-slate-300">Available from</span>
                <input
                  type="date"
                  name="availableFrom"
                  value={formData.availableFrom}
                  onChange={handleInputChange}
                  required
                />
              </label>

              <section>
                <span className="mb-3 block text-sm font-semibold text-slate-300">Amenities</span>
                <div className="flex flex-wrap gap-2">
                  {AMENITIES.map((amenity) => (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`pill-button ${
                        formData.amenities.includes(amenity) ? 'pill-button-active' : ''
                      }`}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <span className="mb-2 block text-sm font-semibold text-slate-300">
                  Photos ({formData.images.length}/5)
                </span>
                <label className="glass flex cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed border-white/15 p-6 text-center hover:bg-white/10">
                  <FiImage size={28} className="text-indigo-300" />
                  <span className="text-slate-300">Select up to 5 room photos</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageInput}
                    className="hidden"
                    disabled={formData.images.length >= 5}
                  />
                </label>

                {formData.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {formData.images.map((image, index) => (
                      <div key={image} className="relative aspect-square overflow-hidden rounded-lg border border-white/10">
                        <img src={image} alt={`Listing upload ${index + 1}`} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute right-2 top-2 rounded-lg bg-black/65 p-2 text-red-200 hover:bg-red-600"
                          aria-label="Remove photo"
                          title="Remove photo"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-lg bg-indigo-600 py-3 font-semibold hover:bg-indigo-500 disabled:opacity-60"
                >
                  {loading ? 'Saving...' : isEditing ? 'Update listing' : 'Create listing'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="glass px-6 py-3 font-semibold hover:bg-white/10"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </motion.section>
      </main>
    </div>
  );
}
