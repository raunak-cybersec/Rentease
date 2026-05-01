import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiBookmark, FiCheckCircle, FiMapPin } from 'react-icons/fi';
import { formatCurrency, getListingImage } from '../utils/listings';

export default function ListingCard({ listing, saved = false, onToggleSave }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass card-hover overflow-hidden"
    >
      <Link to={`/listings/${listing._id}`} className="block">
        <img
          src={getListingImage(listing)}
          alt={listing.title}
          className="h-52 w-full object-cover"
          loading="lazy"
        />
      </Link>

      <div className="p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <Link to={`/listings/${listing._id}`} className="min-w-0 hover:text-indigo-300">
            <h3 className="truncate text-lg font-semibold">{listing.title}</h3>
          </Link>

          {onToggleSave && (
            <button
              type="button"
              onClick={() => onToggleSave(listing._id)}
              className="icon-button text-emerald-300"
              aria-label={saved ? 'Remove saved listing' : 'Save listing'}
              title={saved ? 'Remove saved listing' : 'Save listing'}
            >
              {saved ? <FiCheckCircle size={20} /> : <FiBookmark size={20} />}
            </button>
          )}
        </div>

        <p className="mb-3 text-2xl font-bold text-emerald-300">
          {formatCurrency(listing.rent)}
          <span className="text-sm font-medium text-slate-400">/month</span>
        </p>

        <div className="mb-4 flex items-center gap-2 text-sm text-slate-300">
          <FiMapPin size={16} />
          <span className="truncate">
            {listing.locality}, {listing.city}
          </span>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <span className="badge badge-indigo">{listing.type}</span>
          <span className="badge">{listing.genderPreference}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {(listing.amenities || []).slice(0, 4).map((amenity) => (
            <span key={amenity} className="mini-badge">
              {amenity}
            </span>
          ))}
          {(listing.amenities || []).length > 4 && (
            <span className="mini-badge text-slate-400">
              +{listing.amenities.length - 4}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}
