import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';

const ShieldCheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const formatPrice = (price) => {
  if (!price) return '—';
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
  return `₹${price.toLocaleString()}`;
};

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadFavorites = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/favorites');
      setFavorites(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load favorites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFavorites(); }, []);

  const handleToggle = async (propertyId) => {
    try {
      await api.post(`/favorites/${propertyId}`);
      setFavorites((prev) => prev.filter((p) => p._id !== propertyId));
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to update favorite');
    }
  };

  return (
    <div className="bg-surface min-h-screen">
      <div className="az-container py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-playfair text-3xl font-bold text-primary">My Wishlist</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your saved properties and contact agents directly.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-card bg-white shadow-card overflow-hidden">
                <div className="h-52 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-5 w-3/4 rounded bg-gray-200" />
                  <div className="h-4 w-1/2 rounded bg-gray-200" />
                  <div className="flex gap-2 pt-2">
                    <div className="h-9 flex-1 rounded-lg bg-gray-200" />
                    <div className="h-9 flex-1 rounded-lg bg-gray-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="rounded-card bg-white py-16 text-center shadow-card">
            <div className="text-5xl mb-4">❤️</div>
            <h3 className="font-playfair text-2xl font-bold text-primary">Your Wishlist is Empty</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
              Save properties you like to compare and revisit them anytime.
            </p>
            <Link to="/properties" className="btn-primary mt-6 inline-flex">
              Browse Properties
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-gray-500">
              <span className="font-semibold text-primary">{favorites.length}</span> saved properties
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {favorites.map((property) => (
                <article key={property._id} className="property-card group">
                  {/* Image */}
                  <div className="relative h-52 overflow-hidden">
                    {property.images?.[0] ? (
                      <img
                        src={property.images[0].url || property.images[0]}
                        alt={property.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                        <span className="text-5xl">🏢</span>
                      </div>
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                    {/* RERA badge top-left */}
                    <span className="rera-badge absolute left-3 top-3">
                      <ShieldCheckIcon /> RERA Verified
                    </span>

                    {/* Wishlist heart top-right */}
                    <button
                      onClick={() => handleToggle(property._id)}
                      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-red-500 shadow transition hover:bg-white hover:scale-110"
                      title="Remove from wishlist"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>

                    {/* Price overlay bottom-left */}
                    <p className="text-price absolute bottom-3 left-3 text-lg text-white">
                      {formatPrice(property.price)}
                    </p>
                  </div>

                  {/* Card info */}
                  <div className="p-5">
                    <h2 className="font-playfair text-lg font-semibold text-primary line-clamp-1">
                      {property.title}
                    </h2>
                    <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {property.city}, {property.state}
                    </p>

                    {/* Property chips */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {property.bedrooms && (
                        <span className="rounded-lg bg-surface px-2.5 py-1 text-xs font-medium text-gray-600">
                          🛏 {property.bedrooms} BHK
                        </span>
                      )}
                      {property.area && (
                        <span className="rounded-lg bg-surface px-2.5 py-1 text-xs font-medium text-gray-600">
                          📐 {property.area} sqft
                        </span>
                      )}
                      <span className="rounded-lg bg-surface px-2.5 py-1 text-xs font-medium text-gray-600 capitalize">
                        🏠 {property.propertyType}
                      </span>
                    </div>

                    {/* CTAs */}
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => handleToggle(property._id)}
                        className="btn-outline flex-1 gap-1.5 py-2.5 text-xs text-red-600 border-red-200 hover:bg-red-50 hover:border-red-400"
                      >
                        <TrashIcon /> Remove
                      </button>
                      <Link
                        to={`/properties/${property._id}`}
                        className="btn-amber flex-1 justify-center py-2.5 text-xs"
                      >
                        📞 Contact Agent
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
