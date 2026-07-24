import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';

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

  useEffect(() => {
    loadFavorites();
  }, []);

  const handleToggle = async (propertyId) => {
    try {
      await api.post(`/favorites/${propertyId}`);
      await loadFavorites();
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to update favorite');
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Your Favorites</h1>
        <p className="mt-3 text-slate-600">Keep an eye on properties you want to revisit.</p>
      </div>

      {error && <div className="rounded-3xl bg-rose-50 p-6 text-sm text-rose-700">{error}</div>}

      {loading ? (
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm">Loading favorites...</div>
      ) : favorites.length === 0 ? (
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm">You don't have any favorites yet.</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {favorites.map((property) => (
            <div key={property._id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">{property.title}</h2>
                  <p className="mt-2 text-slate-600">{property.city}, {property.state}</p>
                </div>
                <button
                  onClick={() => handleToggle(property._id)}
                  className="rounded-2xl bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-700"
                >
                  Remove
                </button>
              </div>
              <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
                <span>{property.propertyType}</span>
                <span>₹{property.price.toLocaleString()}</span>
              </div>
              <Link to={`/properties/${property._id}`} className="mt-6 inline-block rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900">
                View details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
