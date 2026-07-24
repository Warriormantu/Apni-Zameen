import { useEffect, useState } from 'react';
import api from '../services/api.js';
import { Link } from 'react-router-dom';

const PropertiesPage = () => {
  const [filters, setFilters] = useState({ city: '', listingType: 'sale', propertyType: '' });
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProperties = async () => {
    setLoading(true);
    const response = await api.get('/properties', { params: filters });
    setProperties(response.data.data.items);
    setLoading(false);
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const handleSearch = async (e) => {
    e.preventDefault();
    fetchProperties();
  };

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Search properties</h2>
        <form onSubmit={handleSearch} className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="block text-sm text-slate-700">City</label>
            <input
              name="city"
              value={filters.city}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3"
              placeholder="Enter city"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-700">Listing</label>
            <select
              name="listingType"
              value={filters.listingType}
              onChange={handleChange}
              className="mt-2 rounded-2xl border-slate-200 bg-slate-50 px-4 py-3"
            >
              <option value="sale">Sale</option>
              <option value="rent">Rent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-700">Property Type</label>
            <select
              name="propertyType"
              value={filters.propertyType}
              onChange={handleChange}
              className="mt-2 rounded-2xl border-slate-200 bg-slate-50 px-4 py-3"
            >
              <option value="">All</option>
              <option value="apartment">Apartment</option>
              <option value="villa">Villa</option>
              <option value="house">House</option>
              <option value="commercial">Commercial</option>
              <option value="land">Land</option>
              <option value="pg">PG</option>
              <option value="coliving">Co-living</option>
            </select>
          </div>
          <button type="submit" className="rounded-2xl bg-slate-900 px-6 py-3 text-white">
            Search
          </button>
        </form>
      </section>

      <section className="space-y-6">
        {loading ? (
          <div className="rounded-3xl bg-white p-8 text-center shadow-sm">Loading properties...</div>
        ) : properties.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 text-center shadow-sm">No properties found.</div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {properties.map((property) => (
              <Link
                key={property._id}
                to={`/properties/${property._id}`}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <h3 className="text-xl font-semibold text-slate-900">{property.title}</h3>
                <p className="mt-2 text-slate-600">{property.city}, {property.state}</p>
                <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                  <span>{property.propertyType}</span>
                  <span>₹{property.price.toLocaleString()}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default PropertiesPage;
