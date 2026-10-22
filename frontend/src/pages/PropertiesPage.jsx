import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import PropertyMap from '../components/PropertyMap.jsx';

const MapPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
  </svg>
);

const BedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const AreaIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
  </svg>
);

const HeartIcon = ({ filled }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const SortIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
  </svg>
);

const FALLBACK_BY_TYPE = {
  apartment: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
  villa: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
  house: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80',
  commercial: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
  land: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
  pg: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
};

const listingTypes = [
  { value: '', label: 'All' },
  { value: 'sale', label: 'For Sale' },
  { value: 'rent', label: 'For Rent' },
];

const popularCities = ['All Cities', 'Gurgaon', 'New Delhi', 'Mumbai', 'Bengaluru'];
const gurgaonLocalities = ['Sector 84', 'Sector 65', 'Sector 102', 'DLF Phase 2', 'Golf Course Road', 'Sohna'];

const propertyTypes = ['', 'apartment', 'villa', 'house', 'commercial', 'land', 'pg'];
const bhkOptions = [
  { value: '', label: 'All BHK' },
  { value: '1', label: '1 BHK' },
  { value: '2', label: '2 BHK' },
  { value: '3', label: '3 BHK' },
  { value: '4+', label: '4+ BHK' },
];

const PropertiesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    listingType: searchParams.get('listingType') || '',
    propertyType: searchParams.get('propertyType') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    search: searchParams.get('search') || '',
  });
  const [sortBy, setSortBy] = useState('newest');
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || searchParams.get('city') || '');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [hoveredPropertyId, setHoveredPropertyId] = useState(null);
  const [showMobileMap, setShowMobileMap] = useState(false);
  const { user } = useAuth();

  const handleSelectPropertyFromMap = (prop) => {
    setSelectedPropertyId(prop._id);
    const cardEl = document.getElementById(`property-card-${prop._id}`);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const fetchProperties = async (f = filters, pageNum = page, sortOption = sortBy) => {
    setLoading(true);
    try {
      const cleanParams = {
        page: pageNum,
        limit: 12,
        sort: sortOption,
      };
      Object.entries(f).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          cleanParams[key] = val;
        }
      });
      const response = await api.get('/properties', { params: cleanParams });
      const data = response.data?.data;
      setProperties(data?.items || []);
      setTotalPages(data?.totalPages || 1);
      setTotalCount(data?.total || 0);
    } catch (err) {
      console.error('Failed to load properties:', err);
      setProperties([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    if (!user) return;
    try {
      const response = await api.get('/favorites');
      const ids = new Set((response.data.data || []).map((p) => p._id));
      setFavoriteIds(ids);
    } catch {
      // ignore
    }
  };

  const toggleFavorite = async (propertyId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    try {
      await api.post(`/favorites/${propertyId}`);
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (next.has(propertyId)) next.delete(propertyId);
        else next.add(propertyId);
        return next;
      });
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const updated = {
      city: searchParams.get('city') || '',
      listingType: searchParams.get('listingType') || '',
      propertyType: searchParams.get('propertyType') || '',
      bedrooms: searchParams.get('bedrooms') || '',
      search: searchParams.get('search') || '',
    };
    setFilters(updated);
    setSearchInput(updated.search || updated.city || '');
    setPage(1);
    fetchProperties(updated, 1, sortBy);
  }, [searchParams]);

  useEffect(() => {
    fetchProperties(filters, page, sortBy);
    fetchFavorites();
  }, [page, sortBy]);

  const handleSearch = (e) => {
    e?.preventDefault();
    setPage(1);
    const updated = { ...filters, search: searchInput.trim() };
    setFilters(updated);
    fetchProperties(updated, 1, sortBy);
  };

  const setCityFilter = (cityName) => {
    setPage(1);
    const updated = {
      ...filters,
      city: cityName === 'All Cities' ? '' : cityName,
      search: '',
    };
    setSearchInput('');
    setFilters(updated);
    fetchProperties(updated, 1, sortBy);
  };

  const setLocalityFilter = (localityName) => {
    setPage(1);
    setSearchInput(localityName);
    const updated = {
      ...filters,
      city: 'Gurgaon',
      search: localityName,
    };
    setFilters(updated);
    fetchProperties(updated, 1, sortBy);
  };

  const setListingType = (type) => {
    setPage(1);
    const updated = { ...filters, listingType: type };
    setFilters(updated);
    fetchProperties(updated, 1, sortBy);
  };

  const setPropertyType = (type) => {
    setPage(1);
    const updated = { ...filters, propertyType: type };
    setFilters(updated);
    fetchProperties(updated, 1, sortBy);
  };

  const setBedrooms = (bhk) => {
    setPage(1);
    const updated = { ...filters, bedrooms: bhk };
    setFilters(updated);
    fetchProperties(updated, 1, sortBy);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatPrice = (price) => {
    if (!price) return '—';
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
    return `₹${price.toLocaleString()}`;
  };

  return (
    <div className="flex min-h-[calc(100vh-68px)]">
      {/* ── Left: Listings Panel ── */}
      <div className="flex-1 overflow-y-auto">
        {/* Search bar + filters */}
        <div className="sticky top-[68px] z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3.5 sm:px-6 shadow-sm">
          {/* Top row: Search input */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 mb-2.5">
            <div className="relative flex-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by Sector, Locality, Builder, DLF, or BHK..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-9 py-2.5 text-xs sm:text-sm text-primary placeholder-slate-400 focus:bg-white focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/20 transition font-medium"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => { setSearchInput(''); setFilters((prev) => ({ ...prev, search: '' })); fetchProperties({ ...filters, search: '' }, 1, sortBy); }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>
            <button type="submit" className="btn-amber px-5 py-2.5 text-xs sm:text-sm font-bold shrink-0 shadow-sm">
              Search
            </button>
          </form>

          {/* Quick City Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2.5 text-xs">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mr-1">City:</span>
            {popularCities.map((cityName) => {
              const isActive = (cityName === 'All Cities' && !filters.city) || filters.city.toLowerCase() === cityName.toLowerCase();
              return (
                <button
                  key={cityName}
                  onClick={() => setCityFilter(cityName)}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cityName}
                  {cityName === 'Gurgaon' && <span className="ml-1 text-[10px] text-amber">⭐ 1,200+</span>}
                </button>
              );
            })}
          </div>

          {/* Locality Chips for Gurgaon */}
          {(filters.city.toLowerCase() === 'gurgaon' || !filters.city) && (
            <div className="flex flex-wrap items-center gap-1.5 mb-2.5 text-xs overflow-x-auto pb-1 scrollbar-hide">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mr-1 shrink-0">Hot Sectors:</span>
              {gurgaonLocalities.map((loc) => (
                <button
                  key={loc}
                  onClick={() => setLocalityFilter(loc)}
                  className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition shrink-0 ${
                    filters.search === loc
                      ? 'border-amber bg-amber-50 text-amber-900 font-bold shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-amber hover:text-primary'
                  }`}
                >
                  📍 {loc}
                </button>
              ))}
            </div>
          )}

          {/* Filter chips: Sale/Rent, Property Type, BHK, Sort */}
          <div className="flex flex-wrap gap-2 items-center pt-1 border-t border-slate-100">
            {listingTypes.map((item) => (
              <button
                key={item.value}
                onClick={() => setListingType(item.value)}
                className={filters.listingType === item.value ? 'filter-chip-active' : 'filter-chip'}
              >
                {item.label}
              </button>
            ))}

            <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

            {propertyTypes.slice(1).map((type) => (
              <button
                key={type}
                onClick={() => setPropertyType(filters.propertyType === type ? '' : type)}
                className={filters.propertyType === type ? 'filter-chip-active' : 'filter-chip'}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}

            <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

            {/* BHK chips */}
            <div className="flex items-center gap-1">
              {bhkOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setBedrooms(opt.value)}
                  className={`px-2.5 py-1 text-xs rounded-full border transition font-bold ${
                    filters.bedrooms === opt.value
                      ? 'bg-amber text-primary border-amber shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-amber'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="ml-auto flex items-center gap-1.5 text-xs text-slate-500">
              <SortIcon />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-primary focus:outline-none cursor-pointer shadow-sm hover:border-amber"
              >
                <option value="newest">Newest Listed</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="area_desc">Area: Largest First</option>
              </select>
            </div>

            {/* Mobile View Toggle */}
            <button
              type="button"
              onClick={() => setShowMobileMap((prev) => !prev)}
              className="lg:hidden flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-primary hover:border-amber transition shrink-0 shadow-sm"
            >
              {showMobileMap ? '📋 List View' : '🗺️ Map View'}
            </button>
          </div>
        </div>

        {/* Results or Mobile Map */}
        {showMobileMap ? (
          <div className="h-[calc(100vh-210px)] w-full lg:hidden p-3">
            <div className="h-full w-full rounded-2xl overflow-hidden border border-slate-200 shadow-md">
              <PropertyMap
                properties={properties}
                selectedId={selectedPropertyId}
                hoveredId={hoveredPropertyId}
                onSelectProperty={handleSelectPropertyFromMap}
              />
            </div>
          </div>
        ) : (
        <div className="p-4 sm:p-6">
          {/* Header count info & Active Filter Dismiss Ribbon */}
          {!loading && (
            <div className="mb-4 space-y-2">
              <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500">
                <p>
                  Showing <span className="font-extrabold text-primary">{properties.length}</span> of <span className="font-extrabold text-primary">{totalCount}</span> verified properties
                  {filters.city && <> in <span className="font-bold text-primary">📍 {filters.city}</span></>}
                  {filters.search && <> matching "<span className="font-bold text-amber-dark">{filters.search}</span>"</>}
                </p>
                {totalPages > 1 && (
                  <p className="text-xs text-slate-400 font-medium">
                    Page {page} of {totalPages}
                  </p>
                )}
              </div>

              {/* Active Filter Tags */}
              {(filters.city || filters.search || filters.listingType || filters.propertyType || filters.bedrooms) && (
                <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active:</span>
                  {filters.city && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                      City: {filters.city}
                      <button onClick={() => setCityFilter('All Cities')} className="hover:text-red-500 ml-0.5">✕</button>
                    </span>
                  )}
                  {filters.search && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900">
                      Search: {filters.search}
                      <button onClick={() => { setSearchInput(''); setFilters(p => ({ ...p, search: '' })); fetchProperties({ ...filters, search: '' }, 1, sortBy); }} className="hover:text-red-500 ml-0.5">✕</button>
                    </span>
                  )}
                  {filters.bedrooms && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[11px] font-semibold text-blue-900">
                      {filters.bedrooms} BHK
                      <button onClick={() => setBedrooms('')} className="hover:text-red-500 ml-0.5">✕</button>
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setFilters({ city: '', listingType: '', propertyType: '', bedrooms: '', search: '' });
                      setSearchInput('');
                      fetchProperties({ city: '', listingType: '', propertyType: '', bedrooms: '', search: '' }, 1, sortBy);
                    }}
                    className="text-[11px] font-bold text-red-600 hover:underline ml-1"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>
          )}

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse rounded-2xl bg-white p-4 border border-slate-100 shadow-sm">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="h-44 w-full sm:w-52 shrink-0 rounded-xl bg-slate-200" />
                    <div className="flex-1 space-y-3 pt-2">
                      <div className="h-5 w-2/3 rounded-lg bg-slate-200" />
                      <div className="h-4 w-1/3 rounded-lg bg-slate-200" />
                      <div className="flex gap-2 pt-2">
                        <div className="h-6 w-20 rounded-full bg-slate-200" />
                        <div className="h-6 w-20 rounded-full bg-slate-200" />
                      </div>
                      <div className="h-8 w-28 rounded-xl bg-slate-200" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="rounded-3xl bg-white p-12 text-center border border-slate-200/80 shadow-sm max-w-lg mx-auto">
              <div className="text-5xl mb-3">🏡</div>
              <h3 className="font-playfair text-2xl font-bold text-primary">No Properties Found</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
                We couldn't find matches for this specific query. Try clearing your filters or exploring our 1,200+ Gurgaon listings.
              </p>
              <button
                onClick={() => {
                  setFilters({ city: '', listingType: '', propertyType: '', bedrooms: '', search: '' });
                  setSearchInput('');
                  setSortBy('newest');
                  setPage(1);
                  fetchProperties({ city: '', listingType: '', propertyType: '', bedrooms: '', search: '' }, 1, 'newest');
                }}
                className="btn-amber mt-5 px-7 py-3 text-sm font-bold"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {properties.map((property) => {
                const fallbackImg = FALLBACK_BY_TYPE[property.propertyType] || FALLBACK_BY_TYPE.apartment;
                const displayImg = property.images?.[0]?.url || property.images?.[0] || fallbackImg;

                const lat = property.location?.lat || property.position?.[0];
                const lng = property.location?.lng || property.position?.[1];

                return (
                  <div
                    key={property._id}
                    id={`property-card-${property._id}`}
                    onClick={() => setSelectedPropertyId(property._id)}
                    onMouseEnter={() => setHoveredPropertyId(property._id)}
                    onMouseLeave={() => setHoveredPropertyId(null)}
                    className={`property-card cursor-pointer ${
                      selectedPropertyId === property._id
                        ? 'ring-2 ring-amber border-amber shadow-xl bg-amber-50/20'
                        : ''
                    } ${hoveredPropertyId === property._id ? 'border-amber shadow-lg -translate-y-1' : ''}`}
                  >
                    <div className="flex flex-col sm:flex-row">
                      {/* Property Image with Badges */}
                      <div className="relative h-52 w-full shrink-0 overflow-hidden sm:h-auto sm:w-56 bg-slate-100">
                        <img
                          src={displayImg}
                          alt={property.title}
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = fallbackImg;
                          }}
                          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                        {/* Top RERA badge */}
                        <span className="rera-badge absolute left-3 top-3">
                          <ShieldCheckIcon /> RERA Verified
                        </span>

                        {/* Category tag */}
                        <span className="absolute bottom-3 left-3 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                          {property.propertyType || 'Apartment'}
                        </span>

                        {/* Wishlist Heart button */}
                        {user && (
                          <button
                            onClick={(e) => toggleFavorite(property._id, e)}
                            className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-md transition hover:scale-110 ${
                              favoriteIds.has(property._id) ? 'text-red-500' : 'text-slate-400 hover:text-red-500'
                            }`}
                          >
                            <HeartIcon filled={favoriteIds.has(property._id)} />
                          </button>
                        )}
                      </div>

                      {/* Info & Spec Section */}
                      <div className="flex flex-1 flex-col justify-between p-5">
                        <div>
                          {/* Title + Price Row */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <h3 className="font-playfair text-lg font-bold leading-snug text-primary line-clamp-1 hover:text-amber-dark transition">
                                <Link to={`/properties/${property._id}`}>{property.title}</Link>
                              </h3>
                              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                                <MapPinIcon /> {property.location?.address || `${property.city}, ${property.state}`}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-price text-xl text-primary font-black tracking-tight">{formatPrice(property.price)}</p>
                              {property.area && (
                                <p className="text-[11px] font-semibold text-slate-400">
                                  ₹{Math.round(property.price / property.area).toLocaleString()}/sq.ft
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Property Spec Pills */}
                          <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
                            {property.bedrooms > 0 && (
                              <span className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                                <BedIcon /> {property.bedrooms} BHK
                              </span>
                            )}
                            {property.area && (
                              <span className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                                <AreaIcon /> {property.area} sq.ft
                              </span>
                            )}
                            <span className="flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-bold text-amber-800 capitalize">
                              {property.listingType === 'sale' ? 'For Sale' : 'For Rent'}
                            </span>
                            {/* 360° Street View Link */}
                            {lat && lng && lat !== 0 && (
                              <a
                                href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                title="Open in 360° Google Street View"
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition shadow-sm"
                              >
                                🧭 360° Street View ↗
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Agent/Owner Row + Action Buttons */}
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary uppercase shadow-sm">
                              {(property.owner?.name || property.agent?.name || 'A')[0]}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800 leading-none">{property.owner?.name || property.agent?.name || 'Verified Partner'}</p>
                              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">✓ RERA Registered</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Link to={`/properties/${property._id}`} className="btn-ghost text-xs px-3.5 py-1.5 font-bold">
                              Details →
                            </Link>
                            <Link to={`/properties/${property._id}`} className="btn-amber text-xs px-3.5 py-1.5 font-bold shadow-sm">
                              📞 Contact
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Pagination Controls ── */}
          {!loading && totalPages > 1 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-surface-border pt-4">
              <p className="text-xs text-gray-500">
                Page <span className="font-bold text-primary">{page}</span> of <span className="font-bold text-primary">{totalPages}</span> ({totalCount} total listings)
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="rounded-lg border border-surface-border bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Prev
                </button>
                {/* Page number buttons */}
                {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                  let pNum = page <= 3 ? idx + 1 : page + idx - 2;
                  if (pNum > totalPages) pNum = totalPages - (4 - idx);
                  if (pNum < 1) pNum = idx + 1;
                  return (
                    <button
                      key={pNum}
                      onClick={() => handlePageChange(pNum)}
                      className={`h-8 w-8 rounded-lg text-xs font-semibold transition ${
                        page === pNum
                          ? 'bg-primary text-white shadow-sm'
                          : 'border border-surface-border bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  className="rounded-lg border border-surface-border bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
        )}
      </div>

      {/* ── Right: Real Interactive Map Panel ── */}
      <div className="hidden lg:block lg:w-[420px] xl:w-[480px] shrink-0 sticky top-[68px] h-[calc(100vh-68px)] overflow-hidden bg-surface border-l border-surface-border">
        <PropertyMap
          properties={properties}
          selectedId={selectedPropertyId}
          hoveredId={hoveredPropertyId}
          onSelectProperty={handleSelectPropertyFromMap}
        />
      </div>
    </div>
  );
};

export default PropertiesPage;
