import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiSearch } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { CITIES, buildListingQuery } from '../utils/listings';

export default function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');

  const submitSearch = (e) => {
    e.preventDefault();
    const params = buildListingQuery({ search, city });
    navigate(`/browse${params.toString() ? `?${params}` : ''}`);
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
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link to="/admin" className="hover:text-emerald-300">
                    Admin
                  </Link>
                )}
                {user.role !== 'admin' && (
                  <Link to="/messages" className="hover:text-emerald-300">
                    Messages
                  </Link>
                )}
                <Link to="/dashboard" className="hover:text-emerald-300">
                  Dashboard
                </Link>
                <button type="button" onClick={logout} className="text-red-300 hover:text-red-200">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-indigo-300">
                  Login
                </Link>
                <Link to="/signup" className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold hover:bg-indigo-500">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 pb-16 pt-28">
        <section className="max-w-4xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">
            PGs, rooms, studios, flats
          </p>
          <h1 className="text-5xl font-bold leading-tight sm:text-7xl">
            Find your perfect PG or room, hassle-free.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Search detailed rental listings across Mumbai, Delhi, Bangalore, Hyderabad, Pune, and Lucknow.
          </p>

          <form onSubmit={submitSearch} className="glass mt-8 grid gap-3 p-3 md:grid-cols-[1fr_220px_auto]">
            <label className="relative block">
              <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Locality, keyword, or room type"
                className="pl-11"
              />
            </label>
            <select value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">All cities</option>
              {CITIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 font-semibold hover:bg-indigo-500"
            >
              Search <FiArrowRight />
            </button>
          </form>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/browse"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 font-semibold hover:bg-emerald-500"
            >
              Browse Listings <FiArrowRight />
            </Link>
            <Link
              to={user?.role === 'landlord' ? '/create-listing' : user ? '/browse' : '/signup'}
              className="glass inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold hover:bg-white/10"
            >
              List Your Room <FiArrowRight />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
