import { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import PropertyMap from '../components/PropertyMap.jsx';

const MapPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
  </svg>
);

const HeartIcon = ({ filled }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill={filled ? '#EF4444' : 'none'} stroke={filled ? '#EF4444' : 'currentColor'} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const amenityIcons = {
  'Swimming Pool': '🏊',
  'Gymnasium': '🏋️',
  'Parking': '🅿️',
  'Security': '🔒',
  'Garden': '🌿',
  'Kids Play Area': '🎠',
  'Club House': '🏛️',
  'Power Backup': '⚡',
  'Lift': '🛗',
  'Intercom': '📞',
};

const FALLBACK_BY_TYPE = {
  apartment: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80',
  villa: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80',
  house: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80',
  commercial: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
  land: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80',
  pg: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80',
};

const formatPrice = (price) => {
  if (!price) return '—';
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
  return `₹${price.toLocaleString()}`;
};

const PropertyDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageSuccess, setMessageSuccess] = useState(null);
  const [appointmentData, setAppointmentData] = useState({ date: '', time: '', notes: '' });
  const [appointmentSuccess, setAppointmentSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [loanAmount, setLoanAmount] = useState(0);
  const [interestRate, setInterestRate] = useState(8.5);
  const [loanTenure, setLoanTenure] = useState(20);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const emiCalc = useMemo(() => {
    const P = Number(loanAmount) || 0;
    const r = (Number(interestRate) || 8.5) / 12 / 100;
    const n = (Number(loanTenure) || 20) * 12;
    if (P <= 0 || n <= 0) return { emi: 0, totalInterest: 0, totalPayment: 0 };
    const emi = Math.round((P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
    const totalPayment = emi * n;
    const totalInterest = Math.max(0, totalPayment - P);
    return { emi, totalInterest, totalPayment };
  }, [loanAmount, interestRate, loanTenure]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteProperty = async () => {
    if (!window.confirm('Are you sure you want to delete this property listing?')) return;
    setDeleting(true);
    try {
      await api.delete(`/properties/${id}`);
      navigate('/properties');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete property');
    } finally {
      setDeleting(false);
    }
  };

  const loadProperty = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/properties/${id}`);
      const data = response.data.data;
      setProperty(data);
      if (data?.price) {
        setLoanAmount(Math.round(data.price * 0.8));
      }
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load property');
    } finally {
      setLoading(false);
    }
  };

  const loadFavoriteState = async () => {
    if (!user) return;
    try {
      const response = await api.get('/favorites');
      const favorites = response.data.data || [];
      setIsFavorite(favorites.some((item) => item._id === id));
    } catch {
      setIsFavorite(false);
    }
  };

  useEffect(() => { loadProperty(); }, [id]);
  useEffect(() => { loadFavoriteState(); }, [user, id]);

  const toggleFavorite = async () => {
    if (!user) { navigate('/login'); return; }
    setFavoriteLoading(true);
    try {
      await api.post(`/favorites/${id}`);
      setIsFavorite((prev) => !prev);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to update favorite');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!user || !property) return;
    const receiverId =
      property.agent?._id ||
      property.agent?.id ||
      property.owner?._id ||
      property.owner?.id ||
      (typeof property.owner === 'string' ? property.owner : null);
    if (!receiverId) { setError('No receiver available'); return; }
    try {
      await api.post('/messages', { property: id, receiver: receiverId, message: messageText });
      setMessageSuccess('Message sent successfully!');
      setMessageText('');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to send message');
    }
  };

  const requestAppointment = async () => {
    if (!user || !property) return;
    try {
      await api.post('/appointments', { property: id, ...appointmentData });
      setAppointmentSuccess('Site visit requested successfully!');
      setAppointmentData({ date: '', time: '', notes: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to request appointment');
    }
  };

  if (loading) {
    return (
      <div className="az-container py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 rounded bg-gray-200" />
          <div className="h-80 rounded-card-lg bg-gray-200" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 h-48 rounded-card bg-gray-200" />
            <div className="h-48 rounded-card bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="az-container py-20 text-center">
        <div className="text-5xl mb-4">🏚️</div>
        <h2 className="font-playfair text-2xl font-bold text-primary">Property Not Found</h2>
        <p className="mt-2 text-gray-500">This property may have been removed or doesn't exist.</p>
        <Link to="/properties" className="btn-primary mt-6 inline-flex">Browse Properties</Link>
      </div>
    );
  }

  const images = property.images?.length
    ? property.images.map((img) => img.url || img)
    : ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80'];

  const agentName = property.owner?.name || property.agent?.name || 'Verified Consultant';
  const emiMonthly = property.price ? Math.round(property.price * 0.008).toLocaleString() : null;

  return (
    <div className="bg-surface">
      <div className="az-container py-6">
        {/* ── Breadcrumb ── */}
        <nav className="mb-4 flex items-center gap-2 text-xs text-gray-400">
          <Link to="/" className="hover:text-primary transition">Home</Link>
          <span>›</span>
          <Link to="/properties" className="hover:text-primary transition">{property.city || 'Properties'}</Link>
          <span>›</span>
          <span className="text-gray-600 font-medium line-clamp-1">{property.title}</span>
        </nav>

        {/* ── Title Row ── */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-playfair text-3xl font-bold text-primary leading-tight">
              {property.title}
            </h1>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
              <MapPinIcon /> {property.location?.address || `${property.city}, ${property.state}`}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="rera-badge">
              <ShieldCheckIcon /> RERA VERIFIED
            </span>
            <button
              onClick={toggleFavorite}
              disabled={favoriteLoading}
              className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition ${
                isFavorite ? 'border-red-300 bg-red-50 text-red-500' : 'border-surface-border bg-white text-gray-400 hover:border-red-300 hover:text-red-400'
              }`}
            >
              <HeartIcon filled={isFavorite} />
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_360px]">
          {/* ── Left Column ── */}
          <div className="space-y-6">
            {/* Hero image */}
            <div className="overflow-hidden rounded-card-lg bg-gray-100">
              <div className="relative h-72 sm:h-96">
                <img
                  src={images[activeImage] || FALLBACK_BY_TYPE[property.propertyType] || FALLBACK_BY_TYPE.apartment}
                  alt={property.title}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_BY_TYPE[property.propertyType] || FALLBACK_BY_TYPE.apartment;
                  }}
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-4 left-4 rounded-lg bg-black/50 px-3 py-1.5 backdrop-blur-sm">
                  <p className="text-price text-lg text-white">{formatPrice(property.price)}</p>
                </div>
              </div>
              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto p-3 scrollbar-hide">
                  {images.slice(0, 5).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-lg transition ${activeImage === idx ? 'ring-2 ring-amber' : 'opacity-70 hover:opacity-100'}`}
                    >
                      <img
                        src={img || FALLBACK_BY_TYPE[property.propertyType] || FALLBACK_BY_TYPE.apartment}
                        alt={`View ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = FALLBACK_BY_TYPE[property.propertyType] || FALLBACK_BY_TYPE.apartment;
                        }}
                        className="h-full w-full object-cover"
                      />
                      {idx === 4 && images.length > 5 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs font-bold text-white">
                          +{images.length - 5}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Overview */}
            <div className="rounded-card bg-white p-6 shadow-card">
              <h2 className="font-playfair text-2xl font-bold text-primary">Overview</h2>
              {property.description && (
                <p className="mt-3 text-sm leading-7 text-gray-600">{property.description}</p>
              )}
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: 'Configuration', value: property.bedrooms ? `${property.bedrooms} BHK` : property.propertyType },
                  { label: 'Super Area', value: property.area ? `${property.area} sq.ft.` : '—' },
                  { label: 'Status', value: property.status || '—' },
                  { label: 'Type', value: property.propertyType || '—' },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg bg-surface p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{item.label}</p>
                    <p className="mt-1.5 text-sm font-bold text-primary">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities */}
            {property.amenities?.length > 0 && (
              <div className="rounded-card bg-white p-6 shadow-card">
                <h2 className="font-playfair text-2xl font-bold text-primary">Premium Amenities</h2>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {property.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2 rounded-lg bg-surface px-3 py-2.5">
                      <span className="text-lg">{amenityIcons[amenity] || '✨'}</span>
                      <span className="text-xs font-medium text-gray-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location Advantages */}
            <div className="rounded-card bg-white p-6 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-playfair text-2xl font-bold text-primary">Location Advantages</h2>
                {property.location?.lat && property.location?.lng && (
                  <a
                    href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${property.location.lat},${property.location.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition shadow-sm"
                  >
                    🧭 360° Google Street View ↗
                  </a>
                )}
              </div>
              {/* Interactive Property Map */}
              <div className="mt-4 h-64 overflow-hidden rounded-lg border border-surface-border">
                <PropertyMap properties={[property]} selectedId={property._id} showSearch={false} />
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {[
                  { icon: '🎓', label: 'Schools', items: ['Within 2 km radius', 'Multiple options'] },
                  { icon: '🏥', label: 'Hospitals', items: ['Emergency services', 'Specialty clinics'] },
                  { icon: '🚇', label: 'Transit', items: ['Metro connectivity', 'Bus routes'] },
                ].map((poi) => (
                  <div key={poi.label}>
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                      <span>{poi.icon}</span> {poi.label}
                    </p>
                    <ul className="mt-2 space-y-1">
                      {poi.items.map((item) => (
                        <li key={item} className="text-xs text-gray-500">{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Interactive Home Loan EMI Calculator ── */}
            <div className="rounded-card bg-white p-6 shadow-card space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-surface-border pb-4">
                <div>
                  <h2 className="font-playfair text-2xl font-bold text-primary">Home Loan EMI Calculator</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Plan your monthly financing with real-time interest rates.</p>
                </div>
                <span className="rounded-pill bg-primary/10 px-3 py-1 text-xs font-bold text-primary self-start">
                  Estimated EMI: ₹{emiCalc.emi.toLocaleString()}/mo
                </span>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {/* Loan Amount */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-gray-500 uppercase">Loan Amount</span>
                    <span className="text-primary font-bold">{formatPrice(loanAmount)}</span>
                  </div>
                  <input
                    type="range"
                    min="100000"
                    max={property.price || 10000000}
                    step="50000"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full accent-primary cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>₹1 L</span>
                    <span>{formatPrice(property.price)}</span>
                  </div>
                </div>

                {/* Interest Rate */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-gray-500 uppercase">Interest Rate</span>
                    <span className="text-primary font-bold">{interestRate}% p.a.</span>
                  </div>
                  <input
                    type="range"
                    min="6.5"
                    max="15.0"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full accent-amber cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>6.5%</span>
                    <span>15.0%</span>
                  </div>
                </div>

                {/* Tenure */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-gray-500 uppercase">Tenure (Years)</span>
                    <span className="text-primary font-bold">{loanTenure} Years</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="1"
                    value={loanTenure}
                    onChange={(e) => setLoanTenure(Number(e.target.value))}
                    className="w-full accent-primary cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>1 Yr</span>
                    <span>30 Yrs</span>
                  </div>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-3 rounded-xl bg-surface p-4 text-center">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Monthly EMI</p>
                  <p className="mt-1 text-base sm:text-xl font-bold text-amber-dark">₹{emiCalc.emi.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Interest</p>
                  <p className="mt-1 text-base sm:text-xl font-bold text-gray-700">₹{emiCalc.totalInterest.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Payable</p>
                  <p className="mt-1 text-base sm:text-xl font-bold text-primary">₹{emiCalc.totalPayment.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}
          </div>

          {/* ── Right Sidebar (Sticky) ── */}
          <aside>
            <div className="sticky top-[80px] space-y-4">
              {/* Price + CTAs card */}
              <div className="rounded-card bg-white p-6 shadow-card">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Starting Price</p>
                <p className="mt-2 text-price text-3xl text-primary">{formatPrice(property.price)}</p>
                {emiMonthly && (
                  <p className="mt-1 text-xs text-gray-400">* EMI starts at ₹{emiMonthly}/month</p>
                )}

                {user ? (
                  <div className="mt-5 space-y-3">
                    <button
                      onClick={() => setShowContactForm(!showContactForm)}
                      className="btn-amber w-full py-3.5 text-base font-bold"
                    >
                      📅 Book a Site Visit
                    </button>
                    <button
                      onClick={() => setShowContactForm(!showContactForm)}
                      className="btn-ghost w-full py-3.5"
                    >
                      💬 Chat with Agent
                    </button>
                  </div>
                ) : (
                  <div className="mt-5 space-y-3">
                    <Link to="/login" className="btn-amber w-full py-3.5 text-base font-bold text-center block">
                      📅 Book a Site Visit
                    </Link>
                    <Link to="/login" className="btn-ghost w-full py-3.5 text-center block">
                      💬 Chat with Agent
                    </Link>
                  </div>
                )}

                <p className="mt-3 text-center text-xs text-gray-400">🔒 Safe & Secure Inquiry</p>
              </div>

              {/* Agent card */}
              <div className="rounded-card bg-white p-5 shadow-card space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary uppercase">
                    {agentName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-primary text-sm truncate">{agentName}</p>
                    <p className="text-xs text-gray-400 capitalize">{property.owner?.role || 'Verified Consultant'}</p>
                    {property.owner?.phone && (
                      <p className="text-xs font-semibold text-gray-600 mt-0.5">{property.owner.phone}</p>
                    )}
                  </div>
                </div>

                {/* Direct Action buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-surface-border">
                  <a
                    href={`tel:${property.owner?.phone || property.agent?.phone || '+919876543210'}`}
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-surface py-2 text-xs font-bold text-primary hover:bg-gray-200 transition"
                  >
                    📞 Call
                  </a>
                  <a
                    href={`https://wa.me/${(property.owner?.phone || property.agent?.phone || '919876543210').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi, I am interested in "${property.title}" on ApniZameen.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-green-50 text-green-700 border border-green-200 py-2 text-xs font-bold hover:bg-green-100 transition"
                  >
                    💬 WhatsApp
                  </a>
                </div>

                {/* Share Link */}
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-surface-border py-2 text-xs font-medium text-gray-600 hover:border-primary hover:text-primary transition"
                >
                  🔗 {copied ? 'Link Copied to Clipboard!' : 'Share Property'}
                </button>

                {/* Owner Actions */}
                {(() => {
                  const ownerId = property.owner?._id
                    ? String(property.owner._id)
                    : property.owner?.id
                    ? String(property.owner.id)
                    : property.owner
                    ? String(property.owner)
                    : null;
                  const currentUserId = user ? String(user._id || user.id || '') : null;
                  const isOwnerOrAdmin = Boolean(
                    user && ((ownerId && currentUserId && ownerId === currentUserId) || user.role === 'admin')
                  );
                  return isOwnerOrAdmin ? (
                    <div className="pt-2 border-t border-red-100">
                      <button
                        onClick={handleDeleteProperty}
                        disabled={deleting}
                        className="w-full rounded-lg bg-red-50 text-red-600 py-2 text-xs font-bold hover:bg-red-100 transition border border-red-200"
                      >
                        {deleting ? 'Deleting...' : '🗑️ Delete This Listing'}
                      </button>
                    </div>
                  ) : null;
                })()}
              </div>

              {/* Contact/Appointment forms */}
              {showContactForm && user && (
                <div className="rounded-card bg-white p-5 shadow-card space-y-5">
                  {/* Message form */}
                  {!messageSuccess ? (
                    <div>
                      <h3 className="text-sm font-semibold text-primary mb-3">Send a Message</h3>
                      <textarea
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        rows="3"
                        className="az-input text-sm"
                        placeholder="Hi, I'm interested in this property..."
                      />
                      <button onClick={sendMessage} className="btn-primary w-full mt-2 py-2.5 text-sm">
                        Send Message
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-lg bg-rera-light px-4 py-3 text-sm text-rera font-medium">
                      ✓ {messageSuccess}
                    </div>
                  )}

                  <div className="border-t border-surface-border pt-5">
                    <h3 className="text-sm font-semibold text-primary mb-3">Request a Site Visit</h3>
                    {!appointmentSuccess ? (
                      <div className="space-y-3">
                        <input
                          type="date"
                          value={appointmentData.date}
                          onChange={(e) => setAppointmentData((p) => ({ ...p, date: e.target.value }))}
                          className="az-input text-sm"
                        />
                        <input
                          type="time"
                          value={appointmentData.time}
                          onChange={(e) => setAppointmentData((p) => ({ ...p, time: e.target.value }))}
                          className="az-input text-sm"
                        />
                        <textarea
                          value={appointmentData.notes}
                          onChange={(e) => setAppointmentData((p) => ({ ...p, notes: e.target.value }))}
                          rows="2"
                          className="az-input text-sm"
                          placeholder="Any notes for the visit..."
                        />
                        <button onClick={requestAppointment} className="btn-amber w-full py-2.5 text-sm font-bold">
                          Confirm Visit Request
                        </button>
                      </div>
                    ) : (
                      <div className="rounded-lg bg-rera-light px-4 py-3 text-sm text-rera font-medium">
                        ✓ {appointmentSuccess}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsPage;
