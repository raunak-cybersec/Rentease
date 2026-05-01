import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiFilter, FiSearch, FiShare2, FiX } from 'react-icons/fi';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import ListingCard from '../components/ListingCard';
import { AMENITIES, CITIES, GENDERS, ROOM_TYPES, buildListingQuery } from '../utils/listings';

const RENT_MIN = 100;
const RENT_MAX = 1000000;
const RENT_STEP = 100;

const getInitialMaxRent = (searchParams) => {
  const value = searchParams.get('maxRent');
  return value ? Number(value) : RENT_MAX;
};

export default function BrowsePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    maxRent: getInitialMaxRent(searchParams),
    type: searchParams.get('type') || '',
    gender: searchParams.get('gender') || '',
    amenities: searchParams.getAll('amenities'),
    search: searchParams.get('search') || '',
    sort: searchParams.get('sort') || 'newest',
  });

  const apiParams = useMemo(
    () =>
      buildListingQuery({
        city: filters.city,
        maxRent: filters.maxRent,
        type: filters.type,
        gender: filters.gender,
        amenities: filters.amenities,
        search: filters.search,
        sort: filters.sort !== 'newest' ? filters.sort : '',
      }),
    [filters],
  );

  useEffect(() => {
    const urlParams = buildListingQuery({
      city: filters.city,
      maxRent: filters.maxRent !== RENT_MAX ? filters.maxRent : '',
      type: filters.type,
      gender: filters.gender,
      amenities: filters.amenities,
      search: filters.search,
      sort: filters.sort !== 'newest' ? filters.sort : '',
    });

    setSearchParams(urlParams, { replace: true });
  }, [filters, setSearchParams]);

  useEffect(() => {
    loadListings();
  }, [apiParams]);

  useEffect(() => {
    if (user) loadSavedListings();
    else setSaved(new Set());
  }, [user]);

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const loadListings = async () => {
    setLoading(true);
    try {
      const query = apiParams.toString();
      const { data } = await api.get(`/listings${query ? `?${query}` : ''}`);
      setListings(data);
    } catch (err) {
      console.error('Error loading listings:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedListings = async () => {
    try {
      const { data } = await api.get('/user/saved');
      setSaved(new Set(data.map((listing) => listing._id)));
    } catch (err) {
      console.error('Error loading saved listings:', err);
    }
  };

  const toggleSave = async (listingId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const { data } = await api.post(`/listings/${listingId}/save`);
      setSaved((current) => {
        const next = new Set(current);
        if (data.saved) next.add(listingId);
        else next.delete(listingId);
        return next;
      });
    } catch (err) {
      console.error('Error toggling save:', err);
    }
  };

  const toggleAmenity = (amenity) => {
    setFilters((current) => {
      const amenities = current.amenities.includes(amenity)
        ? current.amenities.filter((item) => item !== amenity)
        : [...current.amenities, amenity];

      return { ...current, amenities };
    });
  };

  const resetFilters = () => {
    setFilters({
      city: '',
      maxRent: RENT_MAX,
      type: '',
      gender: '',
      amenities: [],
      search: '',
      sort: 'newest',
    });
  };

  const shareUrl = `${window.location.origin}/browse${searchParams.toString() ? `?${searchParams}` : ''}`;

  return (
    <div className="page-bg min-h-screen bg-navy">
      <nav className="glass fixed top-0 z-50 w-full border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-2xl font-bold text-indigo-300">
            RentEase
          </Link>
          <div className="flex items-center gap-4 text-sm sm:text-base">
            {user?.role === 'landlord' && (
              <Link to="/create-listing" className="hover:text-emerald-300">
                List Room
              </Link>
            )}
            {user && user.role !== 'admin' && (
              <Link to="/messages" className="hover:text-emerald-300">
                Messages
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin" className="hover:text-emerald-300">
                Admin
              </Link>
            )}
            <Link to={user ? '/dashboard' : '/login'} className="hover:text-emerald-300">
              {user ? 'Dashboard' : 'Login'}
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-24">
        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
              Live rentals
            </p>
            <h1 className="text-4xl font-bold sm:text-5xl">Find your next PG or room</h1>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(shareUrl)}
              className="glass flex items-center justify-center gap-2 px-4 py-3 hover:bg-white/10"
              title="Copy shareable search link"
            >
              <FiShare2 /> Share
            </button>
            <button
              type="button"
              onClick={() => setShowFilters((value) => !value)}
              className="glass flex items-center justify-center gap-2 px-4 py-3 hover:bg-white/10"
            >
              {showFilters ? <FiX /> : <FiFilter />} Filters
            </button>
          </div>
        </div>

        <section className="mb-6 grid gap-3 lg:grid-cols-[1fr_auto]">
          <label className="relative block">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search locality, keyword, city, or description"
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-11"
            />
          </label>

          <select value={filters.sort} onChange={(e) => updateFilter('sort', e.target.value)}>
            <option value="newest">Newest</option>
            <option value="price-low">Price low to high</option>
            <option value="price-high">Price high to low</option>
          </select>
        </section>

        {showFilters && (
          <section className="glass mb-8 p-5">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <label>
                <span className="mb-2 block text-sm font-semibold text-slate-300">City</span>
                <select value={filters.city} onChange={(e) => updateFilter('city', e.target.value)}>
                  <option value="">All cities</option>
                  {CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className="mb-2 block text-sm font-semibold text-slate-300">
                  Max rent: {new Intl.NumberFormat('en-IN').format(filters.maxRent)}
                </span>
                <input
                  type="range"
                  min={RENT_MIN}
                  max={RENT_MAX}
                  step={RENT_STEP}
                  value={filters.maxRent}
                  onChange={(e) => updateFilter('maxRent', Number(e.target.value))}
                />
              </label>

              <label>
                <span className="mb-2 block text-sm font-semibold text-slate-300">Room type</span>
                <select value={filters.type} onChange={(e) => updateFilter('type', e.target.value)}>
                  <option value="">All types</option>
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
                <select value={filters.gender} onChange={(e) => updateFilter('gender', e.target.value)}>
                  <option value="">Any</option>
                  {GENDERS.map((gender) => (
                    <option key={gender} value={gender}>
                      {gender}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-5">
              <span className="mb-3 block text-sm font-semibold text-slate-300">Amenities</span>
              <div className="flex flex-wrap gap-2">
                {AMENITIES.map((amenity) => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`pill-button ${
                      filters.amenities.includes(amenity) ? 'pill-button-active' : ''
                    }`}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 text-sm font-semibold text-indigo-300 hover:text-indigo-200"
            >
              Reset filters
            </button>
          </section>
        )}

        <div className="mb-5 flex items-center justify-between gap-3">
          <p className="text-slate-400">
            Found <span className="font-semibold text-indigo-300">{listings.length}</span> listings
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="spinner" />
          </div>
        ) : listings.length === 0 ? (
          <div className="glass py-16 text-center">
            <p className="text-lg text-slate-300">No listings match these filters.</p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 rounded-lg bg-indigo-600 px-6 py-3 font-semibold hover:bg-indigo-500"
            >
              Clear search
            </button>
          </div>
        ) : (
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard
                key={listing._id}
                listing={listing}
                saved={saved.has(listing._id)}
                onToggleSave={toggleSave}
              />
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
