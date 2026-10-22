import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
  </svg>
);

const collections = [
  {
    id: 1,
    title: 'RERA Verified Luxury Residencies',
    subtitle: 'Invest with complete peace of mind in certified luxury developments.',
    count: '1,240+ Live Properties',
    tag: 'Premium Apartments',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
    rera: true,
    filter: 'propertyType=apartment&city=Gurgaon',
  },
  {
    id: 2,
    title: 'Zero Brokerage Direct Homes',
    subtitle: 'Direct owner listings to save your hard-earned lakhs in brokerage.',
    count: '850+ Verified Listings',
    tag: 'Ready to Move',
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80',
    rera: true,
    filter: 'listingType=sale',
  },
  {
    id: 3,
    title: 'Gated Luxury Villas & Penthouses',
    subtitle: 'Exclusive private estates, landscaped gardens, and smart home automation.',
    count: '320+ Exclusive Plots',
    tag: 'Villas & Penthouses',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    rera: true,
    filter: 'propertyType=villa',
  },
];

const stats = [
  { value: '10,700+', label: 'Gurgaon & NCR Listings', icon: '🏢' },
  { value: '1,200+', label: 'Active Live Properties', icon: '📍' },
  { value: '100%', label: 'RERA Geocoded Locations', icon: '🛡️' },
  { value: '4.9 / 5', label: 'Buyer Satisfaction Score', icon: '⭐' },
];

const tabs = [
  { id: 'Buy', label: '🏡 Buy Homes' },
  { id: 'Rent', label: '🔑 Rent' },
  { id: 'Commercial', label: '🏢 Commercial' },
  { id: 'Plot', label: '📐 Plots & Land' },
];

const gurgaonHotspots = [
  { name: 'Golf Course Road', sector: 'Sector 54, 42', count: '340+ Homes', avg: '₹2.8 Cr - ₹15 Cr', img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80' },
  { name: 'DLF Cyber City', sector: 'Phase 2, Phase 3', count: '280+ Homes', avg: '₹1.5 Cr - ₹6.5 Cr', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80' },
  { name: 'New Gurgaon & Sec 84', sector: 'Sector 84, 85, 86', count: '410+ Homes', avg: '₹85 L - ₹2.2 Cr', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80' },
  { name: 'Golf Course Extension', sector: 'Sector 65, 66', count: '190+ Homes', avg: '₹1.8 Cr - ₹8 Cr', img: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&q=80' },
];

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('Buy');
  const [selectedCity, setSelectedCity] = useState('Gurgaon');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e?.preventDefault();
    const query = new URLSearchParams();
    const trimmed = searchQuery.trim();

    if (selectedCity && selectedCity !== 'All') {
      query.set('city', selectedCity);
    }

    if (trimmed) {
      const knownCities = ['gurgaon', 'delhi', 'new delhi', 'mumbai', 'bengaluru', 'bangalore'];
      if (knownCities.includes(trimmed.toLowerCase())) {
        query.set('city', trimmed);
      } else {
        query.set('search', trimmed);
      }
    }

    if (activeTab === 'Plot') {
      query.set('listingType', 'sale');
      query.set('propertyType', 'land');
    } else if (activeTab === 'Commercial') {
      query.set('propertyType', 'commercial');
    } else {
      query.set('listingType', activeTab.toLowerCase());
    }

    navigate(`/properties?${query.toString()}`);
  };

  const handleQuickSearch = (term) => {
    setSearchQuery(term);
    const query = new URLSearchParams();
    const knownCities = ['gurgaon', 'delhi', 'new delhi', 'mumbai', 'bengaluru', 'bangalore'];
    if (knownCities.includes(term.toLowerCase())) {
      query.set('city', term);
    } else {
      query.set('search', term);
    }
    if (activeTab === 'Plot') {
      query.set('listingType', 'sale');
      query.set('propertyType', 'land');
    } else if (activeTab === 'Commercial') {
      query.set('propertyType', 'commercial');
    } else {
      query.set('listingType', activeTab.toLowerCase());
    }
    navigate(`/properties?${query.toString()}`);
  };

  return (
    <div className="bg-surface font-sans">
      {/* ── Luxury Hero Section ── */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        {/* Background photo */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1596436823697-3e545dcecf5e?w=1800&q=85')`,
          }}
        />
        {/* Radial Luxury Vignette */}
        <div className="hero-overlay absolute inset-0" />

        {/* Ambient Glow Orbs */}
        <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-amber/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-light/20 rounded-full blur-3xl pointer-events-none" />

        {/* Hero Content */}
        <div className="relative z-10 az-container text-center py-20 lg:py-28 max-w-5xl">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-xs font-semibold text-amber shadow-lg backdrop-blur-md mb-6 animate-in fade-in zoom-in-95 duration-500">
            <span className="flex h-2 w-2 rounded-full bg-amber animate-ping" />
            <span>Over 1,200+ Live Verified Properties in Gurgaon</span>
          </div>

          {/* Headline */}
          <h1 className="font-playfair text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight">
            Find Your Dream <span className="gradient-gold-text italic font-serif">Zameen</span>
          </h1>
          <p className="mt-4 text-base sm:text-xl text-slate-200 font-light max-w-2xl mx-auto leading-relaxed">
            आपकी अपनी ज़मीन, आपका अपना आशियाना. India’s most trusted real estate ecosystem with interactive Street & Satellite maps.
          </p>

          {/* Luxury Search Widget */}
          <div className="mt-10 mx-auto max-w-3xl">
            <div className="rounded-3xl bg-white/95 p-3 shadow-2xl backdrop-blur-xl border border-white/40">
              {/* Category Tabs */}
              <div className="flex flex-wrap gap-1 p-1 mb-2 bg-slate-100/80 rounded-2xl">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 min-w-[120px] rounded-xl py-2.5 text-xs sm:text-sm font-bold transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-primary text-white shadow-md'
                        : 'text-slate-600 hover:text-primary hover:bg-white/60'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Main Search Input Row */}
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-2 px-1">
                {/* City Dropdown */}
                <div className="w-full sm:w-44 shrink-0">
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-3.5 text-xs font-bold text-primary focus:outline-none focus:ring-2 focus:ring-amber"
                  >
                    <option value="Gurgaon">📍 Gurgaon (NCR)</option>
                    <option value="New Delhi">📍 New Delhi</option>
                    <option value="Noida">📍 Noida</option>
                    <option value="Mumbai">📍 Mumbai</option>
                    <option value="Bengaluru">📍 Bengaluru</option>
                    <option value="All">🌐 All Cities</option>
                  </select>
                </div>

                {/* Search Text Input */}
                <div className="flex flex-1 w-full items-center gap-2.5 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3.5 focus-within:border-amber focus-within:ring-2 focus-within:ring-amber/20 transition">
                  <SearchIcon />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by sector, landmark, or project (e.g. Sector 84, Golf Course Rd)..."
                    className="flex-1 border-0 bg-transparent text-xs sm:text-sm text-primary placeholder-slate-400 focus:outline-none font-medium"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Submit Search Button */}
                <button
                  type="submit"
                  className="w-full sm:w-auto btn-amber shrink-0 gap-2 px-7 py-3.5 text-sm font-bold shadow-md"
                >
                  <SearchIcon />
                  <span>Search Properties</span>
                </button>
              </form>

              {/* Trending Localities Quick Badges */}
              <div className="flex flex-wrap items-center gap-1.5 px-3 pb-2 pt-2.5 text-xs border-t border-slate-100 mt-2">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Trending:</span>
                {[
                  { label: '⭐ Sector 84 (Gurgaon)', value: 'Sector 84' },
                  { label: 'Golf Course Road', value: 'Golf Course Road' },
                  { label: 'DLF Phase 2', value: 'DLF Phase 2' },
                  { label: 'Sector 65', value: 'Sector 65' },
                  { label: 'Dwarka Expressway', value: 'Dwarka Expressway' },
                  { label: 'Sohna Road', value: 'Sohna Road' },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleQuickSearch(item.value)}
                    className="rounded-full bg-slate-100 hover:bg-amber-100 hover:text-amber-900 px-2.5 py-1 text-[11px] text-slate-700 font-semibold transition"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <span className="flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md shadow-sm">
              <span className="text-emerald-400">✓</span> 100% RERA Verified
            </span>
            <span className="flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md shadow-sm">
              ⚡ Zero Brokerage Options
            </span>
            <span className="flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md shadow-sm">
              🧭 Interactive 360° Street View
            </span>
            <span className="flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md shadow-sm">
              🔒 Safe Direct Owner Contact
            </span>
          </div>
        </div>
      </section>

      {/* ── Key Market Metrics Ticker ── */}
      <section className="bg-primary border-b border-primary-light/40 relative z-20">
        <div className="az-container py-7">
          <div className="grid grid-cols-2 gap-6 text-center lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="py-2 border-r last:border-0 border-white/10">
                <p className="text-2xl sm:text-3xl font-extrabold text-amber font-sans tracking-tight flex items-center justify-center gap-2">
                  <span>{stat.icon}</span> {stat.value}
                </p>
                <p className="mt-1 text-xs sm:text-sm text-slate-300 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gurgaon Prime Corridors Spotlight ── */}
      <section className="py-16 bg-white border-b border-slate-100">
        <div className="az-container">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="inline-block rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">
                ⭐ Featured Real Estate Hub
              </span>
              <h2 className="section-title">Explore Prime Gurgaon Corridors</h2>
              <p className="mt-2 text-sm text-slate-500 max-w-xl">
                Browse hand-picked luxury residential projects across Millennium City's most coveted sectors.
              </p>
            </div>
            <Link
              to="/properties?city=Gurgaon"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-amber transition"
            >
              View All 1,200+ Gurgaon Properties <ArrowRightIcon />
            </Link>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {gurgaonHotspots.map((spot) => (
              <Link
                key={spot.name}
                to={`/properties?city=Gurgaon&search=${encodeURIComponent(spot.name)}`}
                className="group relative overflow-hidden rounded-2xl bg-slate-900 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="h-64 w-full overflow-hidden">
                  <img
                    src={spot.img}
                    alt={spot.name}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B] via-[#0B132B]/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <span className="inline-block rounded-full bg-amber/90 text-primary text-[10px] font-extrabold px-2.5 py-0.5 mb-1.5 uppercase">
                    {spot.count}
                  </span>
                  <h3 className="font-playfair text-xl font-bold leading-tight group-hover:text-amber transition-colors">
                    {spot.name}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">{spot.sector}</p>
                  <p className="text-xs font-bold text-amber mt-2 flex items-center justify-between">
                    <span>{spot.avg}</span>
                    <span className="text-xs group-hover:translate-x-1 transition-transform">Explore →</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Curated Collections ── */}
      <section className="py-20 bg-slate-50/70">
        <div className="az-container">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Handpicked Portfolio</span>
              <h2 className="section-title mt-1">Curated Collections</h2>
              <p className="mt-2 text-sm text-slate-500">
                Special properties categorized by lifestyle, investment yield, and family comfort.
              </p>
            </div>
            <Link to="/properties" className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-primary hover:text-amber transition">
              View All Properties <ArrowRightIcon />
            </Link>
          </div>

          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((col) => (
              <Link
                key={col.id}
                to={`/properties?${col.filter}`}
                className="group property-card"
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={col.image}
                    alt={col.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute top-3.5 left-3.5 flex gap-2">
                    {col.rera && (
                      <span className="rera-badge">
                        <ShieldCheckIcon /> RERA Certified
                      </span>
                    )}
                  </div>
                  <span className="absolute bottom-3.5 left-3.5 category-tag">{col.tag}</span>
                </div>

                {/* Details */}
                <div className="flex items-end justify-between p-6">
                  <div>
                    <h3 className="font-playfair text-xl font-bold text-primary group-hover:text-amber-dark transition-colors">{col.title}</h3>
                    <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">{col.subtitle}</p>
                    <p className="mt-3 text-xs font-bold text-emerald-700">{col.count}</p>
                  </div>
                  <div className="ml-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-all duration-200">
                    <ArrowRightIcon />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Choose ApniZameen (Matrix of Trust) ── */}
      <section className="bg-white py-20 border-y border-slate-100">
        <div className="az-container">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Peace of Mind</span>
            <h2 className="section-title mt-1">Why Families Trust ApniZameen</h2>
            <p className="mt-3 text-sm text-slate-500 leading-relaxed">
              Every listing, builder, and agent is verified against Indian real estate regulations to protect your family's investment.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: '🛡️', title: '100% RERA Verified', desc: 'Government RERA registration validation on every listed project to guarantee your legal security.' },
              { icon: '💰', title: 'Zero Brokerage Savings', desc: 'Direct owner and builder listings that save you lakhs in traditional real estate commission fees.' },
              { icon: '🗺️', title: 'Interactive Map & Street View', desc: 'Inspect neighbourhood roads, metro proximity, schools, and 360° panoramas before visiting.' },
              { icon: '💬', title: 'Instant Chat & Inquiry', desc: 'Message verified agents and owners directly with zero spam, privacy protection, and fast responses.' },
              { icon: '📅', title: 'One-Tap Site Visits', desc: 'Schedule private visits directly through the platform with immediate date and time confirmation.' },
              { icon: '📊', title: 'Real Market Price Index', desc: 'Accurate price/sq.ft metrics backed by live Gurgaon registry and market data.' },
            ].map((item) => (
              <div
                key={item.title}
                className="group rounded-2xl border border-slate-200/80 bg-white p-7 transition-all duration-300 hover:border-amber/60 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-2xl shadow-sm group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="mt-4 text-base font-bold text-primary group-hover:text-amber-dark transition-colors">{item.title}</h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials Trust Section ── */}
      <section className="py-20 bg-slate-50">
        <div className="az-container">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Verified Testimonials</span>
            <h2 className="section-title mt-1">Real Stories from Homeowners</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                name: 'Vikram Malhotra',
                role: 'Buyer • Sector 84 Gurgaon',
                quote: 'The 360° Street View and exact map pin saved us weeks of wasted visits. Found our 3 BHK dream home with zero brokerage!',
                rating: 5,
              },
              {
                name: 'Pooja & Sameer Singhal',
                role: 'Owners • Golf Course Road',
                quote: 'Listed our penthouse in Gurgaon and got 4 serious buyers within 48 hours. The RERA verification badge built instant trust.',
                rating: 5,
              },
              {
                name: 'Dr. Ananya Roy',
                role: 'Buyer • New Delhi',
                quote: 'ApniZameen made property hunting transparent. The price/sqft comparison and direct owner messaging was effortless.',
                rating: 5,
              },
            ].map((t) => (
              <div key={t.name} className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex text-amber text-sm mb-3">
                    {'★'.repeat(t.rating)}
                  </div>
                  <p className="text-slate-700 text-xs sm:text-sm leading-relaxed italic">
                    "{t.quote}"
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary text-white font-bold flex items-center justify-center text-xs">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-primary">{t.name}</p>
                    <p className="text-[11px] text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Luxury VIP CTA Banner ── */}
      <section className="py-20 bg-surface">
        <div className="az-container">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0B132B] via-primary to-[#0B132B] px-8 py-14 text-center sm:px-14 border border-amber/30 shadow-2xl">
            {/* Glowing Accent Ring */}
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-amber/10 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <span className="inline-block rounded-full bg-amber/20 border border-amber/30 px-3.5 py-1 text-xs font-bold text-amber uppercase tracking-wider mb-3">
                Join 12,000+ Happy Families
              </span>
              <h2 className="font-playfair text-3xl font-extrabold text-white sm:text-5xl leading-tight">
                Ready to Find Your Own <span className="gradient-gold-text italic font-serif">Zameen</span>?
              </h2>
              <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
                Explore thousands of active Gurgaon and Delhi NCR properties or list yours for free with zero brokerage.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/properties" className="btn-amber w-full sm:w-auto px-8 py-4 text-sm font-bold shadow-xl">
                  Explore All Properties →
                </Link>
                <Link to="/properties/create" className="btn-ghost w-full sm:w-auto border-white/40 text-white px-8 py-4 text-sm font-bold hover:bg-white hover:text-primary">
                  + List Your Property Free
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
