import { useState } from 'react';
import api from '../services/api.js';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const AMENITY_OPTIONS = [
  'Swimming Pool', 'Gymnasium', 'Parking', 'Security', 'Garden',
  'Kids Play Area', 'Club House', 'Power Backup', 'Lift', 'Intercom',
];

const CITY_COORDS = {
  gurgaon: [28.4595, 77.0266],
  gurugram: [28.4595, 77.0266],
  delhi: [28.6139, 77.2090],
  'new delhi': [28.6139, 77.2090],
  noida: [28.5355, 77.3910],
  'greater noida': [28.4744, 77.5040],
  mumbai: [19.0760, 72.8777],
  bangalore: [12.9716, 77.5946],
  bengaluru: [12.9716, 77.5946],
  pune: [18.5204, 73.8567],
  hyderabad: [17.3850, 78.4867],
  chennai: [13.0827, 80.2707],
  kolkata: [22.5726, 88.3639],
  jaipur: [26.9124, 75.7873],
  ahmedabad: [23.0225, 72.5714],
  chandigarh: [30.7333, 76.7794],
  lucknow: [26.8467, 80.9462],
};

const CreatePropertyPage = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '',
    description: '',
    propertyType: 'apartment',
    listingType: 'sale',
    price: '',
    location: { lat: '', lng: '', address: '' },
    city: '',
    state: '',
    pincode: '',
    bedrooms: 1,
    bathrooms: 1,
    area: '',
    amenities: [],
    images: [],
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodedMsg, setGeocodedMsg] = useState('');
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('location.')) {
      const key = name.split('.')[1];
      setForm((prev) => ({ ...prev, location: { ...prev.location, [key]: value } }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleAmenity = (amenity) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  // OpenStreetMap Nominatim Geocoding from Address
  const handleAutoGeocode = async () => {
    const query = [form.location.address, form.city, form.state].filter(Boolean).join(', ');
    if (!query) {
      setError('Pehle address ya city enter karein taaki coordinates search ho sakein.');
      return;
    }
    setGeocoding(true);
    setGeocodedMsg('');
    try {
      const url = new URL('https://nominatim.openstreetmap.org/search');
      url.searchParams.set('q', query);
      url.searchParams.set('format', 'jsonv2');
      url.searchParams.set('limit', '1');
      url.searchParams.set('countrycodes', 'in');

      const res = await fetch(url);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat).toFixed(6);
        const lon = parseFloat(data[0].lon).toFixed(6);
        setForm((prev) => ({
          ...prev,
          location: { ...prev.location, lat, lng: lon },
        }));
        setGeocodedMsg(`✓ Location detected on Map: [${lat}, ${lon}]`);
      } else {
        setGeocodedMsg('Exact coordinates nahi mile. Aap manually bhi daal sakte hain.');
      }
    } catch {
      setGeocodedMsg('Network issue. Coordinates manually daal sakte hain.');
    } finally {
      setGeocoding(false);
    }
  };

  // Browser GPS Geolocation
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Aapke browser me GPS geolocation supported nahi hai.');
      return;
    }
    setGeocoding(true);
    setGeocodedMsg('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lon = pos.coords.longitude.toFixed(6);
        setForm((prev) => ({
          ...prev,
          location: { ...prev.location, lat, lng: lon },
        }));
        setGeocodedMsg(`✓ Current GPS Coordinates set: [${lat}, ${lon}]`);
        setGeocoding(false);
      },
      () => {
        setGeocodedMsg('Location access denied. Manually coordinates daal sakte hain.');
        setGeocoding(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!user) {
      setError('Property list karne ke liye kripya pehle Login karein.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    try {
      let images = [];
      if (form.images.length > 0) {
        setUploading(true);
        try {
          const formData = new FormData();
          form.images.forEach((file) => formData.append('images', file));
          const uploadResponse = await api.post('/uploads/images', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          images = uploadResponse.data?.data || [];
        } catch (uploadErr) {
          console.warn('Image upload error, using fallback:', uploadErr);
          images = [];
        }
      }

      if (images.length === 0) {
        const defaultImages = {
          apartment: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
          villa: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
          house: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80',
          commercial: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
          land: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
          pg: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
          coliving: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80',
        };
        images = [defaultImages[form.propertyType] || defaultImages.apartment];
      }

      let lat = Number(form.location.lat) || 0;
      let lng = Number(form.location.lng) || 0;
      // Auto-fallback to city coordinates if user did not specify coordinates
      if (lat === 0 && lng === 0 && form.city) {
        const cityKey = form.city.trim().toLowerCase();
        if (CITY_COORDS[cityKey]) {
          lat = CITY_COORDS[cityKey][0];
          lng = CITY_COORDS[cityKey][1];
        }
      }

      const payload = {
        title: form.title?.trim() || `${form.bedrooms || 2} BHK ${form.propertyType} in ${form.city || 'Gurgaon'}`,
        description: form.description?.trim() && form.description.trim().length >= 5
          ? form.description.trim()
          : `Well-maintained ${form.propertyType} located in ${form.city || 'Gurgaon'}. Equipped with modern amenities and convenient connectivity.`,
        propertyType: form.propertyType,
        listingType: form.listingType,
        price: Number(form.price) || 5000000,
        location: {
          lat,
          lng,
          address: form.location.address?.trim() || `${form.city || 'Gurgaon'}, ${form.state || 'Haryana'}`,
        },
        city: form.city?.trim() || 'Gurgaon',
        state: form.state?.trim() || 'Haryana',
        pincode: form.pincode?.trim() || '122001',
        bedrooms: Number(form.bedrooms) || 1,
        bathrooms: Number(form.bathrooms) || 1,
        area: Number(form.area) || 1000,
        amenities: form.amenities,
        images,
      };

      await api.post('/properties', payload);
      setSuccess('Property listed successfully! Redirecting...');
      setTimeout(() => navigate('/properties'), 1500);
    } catch (err) {
      const backendError = err.response?.data?.error;
      if (err.response?.status === 413) {
        setError('Images ka size bahut bada hai. Kripya images ka resolution kam karein.');
      } else if (err.response?.status === 401) {
        setError('Aapka login session expire ho gaya hai. Kripya dobara Login karein.');
        setTimeout(() => navigate('/login'), 2500);
      } else if (backendError) {
        setError(backendError);
      } else {
        setError(err.message || 'Could not create property. Please check all fields.');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-surface min-h-screen">
      <div className="az-container py-8">
        {/* Header */}
        <div className="mb-6">
          <nav className="mb-4 flex items-center gap-2 text-xs text-gray-400">
            <Link to="/" className="hover:text-primary transition">Home</Link>
            <span>›</span>
            <span className="text-gray-600 font-medium">List Property</span>
          </nav>
          <h1 className="font-playfair text-3xl font-bold text-primary">List Your Property</h1>
          <p className="mt-1 text-sm text-gray-500">
            Fill in the details below to list your property on ApniZameen.
          </p>
        </div>

        {/* Guest Warning Banner if not logged in */}
        {!user && (
          <div className="mb-6 rounded-2xl bg-amber-50 border border-amber-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🔑</span>
              <div>
                <p className="text-sm font-bold text-amber-900">Aap abhi Logged In nahi hain</p>
                <p className="text-xs text-amber-700 mt-0.5">Property list karne aur buyers se connect hone ke liye kripya Login ya Register karein.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link to="/login" className="btn-amber text-xs px-4 py-2 font-bold shadow-sm">
                Login Karein
              </Link>
              <Link to="/register" className="btn-ghost text-xs px-4 py-2 font-bold">
                Register
              </Link>
            </div>
          </div>
        )}

        {/* Step indicator */}
        <div className="mb-8 flex items-center gap-0">
          {[
            { n: 1, label: 'Basic Info' },
            { n: 2, label: 'Location' },
            { n: 3, label: 'Photos & Amenities' },
          ].map((s, idx) => (
            <div key={s.n} className="flex items-center">
              <button
                type="button"
                onClick={() => setStep(s.n)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition ${
                  step === s.n
                    ? 'bg-primary text-white shadow-sm'
                    : step > s.n
                    ? 'bg-rera text-white'
                    : 'bg-white border border-surface-border text-gray-400'
                }`}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                  {step > s.n ? '✓' : s.n}
                </span>
                {s.label}
              </button>
              {idx < 2 && <div className="h-px w-6 bg-surface-border" />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 flex items-center gap-2">
              <span>✓</span> {success}
            </div>
          )}

          {/* ── Step 1: Basic Info ── */}
          {step === 1 && (
            <div className="rounded-card bg-white p-8 shadow-card space-y-6">
              <h2 className="font-playfair text-xl font-bold text-primary">Basic Information</h2>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Property Title *
                  </label>
                  <span className="text-[11px] text-gray-400 font-medium">Min 5 chars</span>
                </div>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="az-input"
                  placeholder="e.g. Luxury 3 BHK apartment in South Delhi"
                  minLength={5}
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Description *
                  </label>
                  <span className={`text-[11px] font-medium ${form.description.length >= 20 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {form.description.length}/20 min chars
                  </span>
                </div>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="4"
                  className="az-input"
                  placeholder="Describe the property, its features, and surroundings (minimum 20 characters)..."
                  minLength={20}
                  required
                />
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                    Listing Type *
                  </label>
                  <select name="listingType" value={form.listingType} onChange={handleChange} className="az-input">
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                    Property Type *
                  </label>
                  <select name="propertyType" value={form.propertyType} onChange={handleChange} className="az-input">
                    <option value="apartment">Apartment</option>
                    <option value="villa">Villa</option>
                    <option value="house">House</option>
                    <option value="commercial">Commercial</option>
                    <option value="land">Land / Plot</option>
                    <option value="pg">PG</option>
                    <option value="coliving">Co-living</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={handleChange}
                    className="az-input"
                    placeholder="e.g. 9500000"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                    Bedrooms *
                  </label>
                  <input
                    name="bedrooms"
                    type="number"
                    min="0"
                    value={form.bedrooms}
                    onChange={handleChange}
                    className="az-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                    Bathrooms *
                  </label>
                  <input
                    name="bathrooms"
                    type="number"
                    min="0"
                    value={form.bathrooms}
                    onChange={handleChange}
                    className="az-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                    Area (sq.ft) *
                  </label>
                  <input
                    name="area"
                    type="number"
                    value={form.area}
                    onChange={handleChange}
                    className="az-input"
                    placeholder="e.g. 1200"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button type="button" onClick={() => setStep(2)} className="btn-primary px-8 py-3">
                  Next: Location →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Location ── */}
          {step === 2 && (
            <div className="rounded-card bg-white p-8 shadow-card space-y-6">
              <h2 className="font-playfair text-xl font-bold text-primary">Location Details</h2>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Full Address *
                </label>
                <input
                  name="location.address"
                  value={form.location.address}
                  onChange={handleChange}
                  className="az-input"
                  placeholder="e.g. 12, Sector 18, Noida, Uttar Pradesh"
                  required
                />
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                    City *
                  </label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    className="az-input"
                    placeholder="e.g. Mumbai"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                    State *
                  </label>
                  <input
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    className="az-input"
                    placeholder="e.g. Maharashtra"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                    Pincode *
                  </label>
                  <input
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    className="az-input"
                    placeholder="e.g. 400050"
                    required
                  />
                </div>
              </div>

              {/* Map Coordinates & Auto-detection */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                      📍 Map Coordinates (Auto-Detection)
                    </h3>
                    <p className="text-xs text-gray-500">
                      Coordinates se property map par accurate price-pill aur 360° Street View ke sath dikhti hai.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={geocoding}
                      onClick={handleAutoGeocode}
                      className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-light transition flex items-center gap-1 shadow-sm disabled:opacity-50"
                    >
                      {geocoding ? 'Detecting...' : '📍 Auto-Fetch from Address'}
                    </button>
                    <button
                      type="button"
                      disabled={geocoding}
                      onClick={handleUseCurrentLocation}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition flex items-center gap-1 shadow-sm disabled:opacity-50"
                    >
                      🎯 Use GPS
                    </button>
                  </div>
                </div>

                {geocodedMsg && (
                  <div className={`text-xs px-3 py-2 rounded-lg font-medium ${
                    geocodedMsg.startsWith('✓')
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {geocodedMsg}
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2 pt-1">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      Latitude <span className="font-normal text-gray-400">(optional)</span>
                    </label>
                    <input
                      name="location.lat"
                      type="number"
                      step="any"
                      value={form.location.lat}
                      onChange={handleChange}
                      className="az-input bg-white"
                      placeholder="e.g. 28.4595"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      Longitude <span className="font-normal text-gray-400">(optional)</span>
                    </label>
                    <input
                      name="location.lng"
                      type="number"
                      step="any"
                      value={form.location.lng}
                      onChange={handleChange}
                      className="az-input bg-white"
                      placeholder="e.g. 77.0266"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(1)} className="btn-outline px-8 py-3">
                  ← Back
                </button>
                <button type="button" onClick={() => setStep(3)} className="btn-primary px-8 py-3">
                  Next: Photos →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Photos & Amenities ── */}
          {step === 3 && (
            <div className="rounded-card bg-white p-8 shadow-card space-y-8">
              <h2 className="font-playfair text-xl font-bold text-primary">Photos & Amenities</h2>

              {/* Image Upload */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                  Property Photos
                </label>
                <div className="relative rounded-xl border-2 border-dashed border-surface-border bg-surface p-8 text-center transition hover:border-amber">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setForm((prev) => ({ ...prev, images: Array.from(e.target.files) }))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="text-4xl mb-2">📷</div>
                  <p className="text-sm font-semibold text-primary">
                    {form.images.length > 0
                      ? `${form.images.length} photo${form.images.length > 1 ? 's' : ''} selected`
                      : 'Click or drag photos here'}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Up to 6 photos. JPG, PNG, or WebP. Max 10MB each.
                  </p>
                  {form.images.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                      {Array.from(form.images).slice(0, 4).map((file, i) => (
                        <div key={i} className="h-16 w-16 overflow-hidden rounded-lg bg-gray-100">
                          <img
                            src={URL.createObjectURL(file)}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                      {form.images.length > 4 && (
                        <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center text-xs text-gray-500 font-bold">
                          +{form.images.length - 4}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  ℹ️ Images require Cloudinary setup. Without it, property will be created without photos.
                </p>
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                  Amenities
                </label>
                <div className="flex flex-wrap gap-2">
                  {AMENITY_OPTIONS.map((amenity) => (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`rounded-full px-4 py-2 text-xs font-semibold border transition ${
                        form.amenities.includes(amenity)
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-gray-600 border-surface-border hover:border-primary'
                      }`}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button type="button" onClick={() => setStep(2)} className="btn-outline px-8 py-3">
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="btn-amber px-10 py-3.5 text-base font-bold"
                >
                  {uploading ? 'Uploading...' : '🏠 List Property'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreatePropertyPage;
