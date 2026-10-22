import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: '/properties', label: 'Properties' },
    ...(user ? [
      { to: '/favorites', label: 'Wishlist' },
      { to: '/appointments', label: 'Appointments' },
      { to: '/messages', label: 'Messages' },
      { to: '/dashboard', label: 'Dashboard' },
    ] : []),
  ];

  return (
    <div className="flex min-h-screen flex-col bg-surface font-sans selection:bg-amber selection:text-primary">
      {/* ── Luxury Glass Navbar ── */}
      <header className="glass-nav sticky top-0 z-50 border-b border-slate-200/80 shadow-sm transition-all duration-300">
        <div className="az-container flex items-center justify-between py-3.5">
          {/* Brand Logo with Monogram */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary-light to-primary text-white shadow-md shadow-primary/25 border border-amber/30 group-hover:scale-105 group-hover:border-amber transition-all duration-300">
              <span className="font-playfair text-xl font-black text-amber tracking-tighter">AZ</span>
            </div>
            <div className="flex flex-col">
              <span className="font-playfair text-2xl font-bold tracking-tight text-primary leading-none group-hover:text-amber-dark transition-colors">
                Apni<span className="text-amber">Zameen</span>
              </span>
              <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase mt-0.5">
                India's Verified Property Hub
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden items-center gap-7 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={isActive(link.to) ? 'nav-link-active' : 'nav-link'}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to={user ? "/properties/create" : "/login"}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-amber/25 hover:from-amber-600 hover:to-amber-700 hover:shadow-md transition-all active:scale-95"
            >
              <span className="text-sm">+</span> List Property
            </Link>
          </nav>

          {/* Right side icons & user profile */}
          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <>
                <Link
                  to="/favorites"
                  title="Saved Properties"
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-red-500"
                >
                  <HeartIcon />
                </Link>
                <Link
                  to="/appointments"
                  title="Appointments & Visits"
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-primary"
                >
                  <BellIcon />
                </Link>
                <div className="ml-2 flex items-center gap-3 pl-2 border-l border-slate-200">
                  <Link
                    to="/profile"
                    title="My Profile"
                    className="flex items-center gap-2 rounded-xl p-1 pr-3 hover:bg-slate-100 transition group"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-xs font-bold text-white shadow-sm group-hover:bg-amber transition uppercase">
                      {user.name?.[0] || 'U'}
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-primary group-hover:text-amber-dark leading-tight">{user.name?.split(' ')[0]}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{user.role || 'Member'}</p>
                    </div>
                  </Link>
                  <button
                    onClick={logout}
                    className="text-xs font-semibold text-slate-400 hover:text-red-600 transition px-2 py-1 rounded-lg hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-primary transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-xs px-4 py-2"
                >
                  Register Free
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-xl text-primary transition hover:bg-slate-100 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileOpen && (
          <div className="border-t border-slate-200 bg-white/98 backdrop-blur-xl px-5 py-5 shadow-2xl md:hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isActive(link.to)
                      ? 'bg-primary text-white'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <div className="mt-2 space-y-2 pt-3 border-t border-slate-100">
                  <Link
                    to="/properties/create"
                    onClick={() => setMobileOpen(false)}
                    className="btn-amber w-full justify-center"
                  >
                    + List Property
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    👤 My Profile ({user.name})
                  </Link>
                  <button
                    onClick={() => { logout(); setMobileOpen(false); }}
                    className="w-full text-left rounded-xl px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-outline flex-1 justify-center text-xs">Sign In</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary flex-1 justify-center text-xs">Register</Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1">{children}</main>

      {/* ── Luxury Midnight Footer ── */}
      <footer className="bg-[#0B132B] text-white border-t-2 border-amber/30 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/4 -translate-y-1/2 w-96 h-96 bg-amber/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 translate-y-1/2 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="az-container py-14 relative z-10">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
            {/* Brand column */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-lg border border-amber/40">
                  <span className="font-playfair text-xl font-black text-white">AZ</span>
                </div>
                <div>
                  <span className="font-playfair text-2xl font-bold tracking-tight text-white leading-none">
                    Apni<span className="text-amber">Zameen</span>
                  </span>
                  <p className="text-[10px] tracking-widest text-slate-400 uppercase mt-0.5">India's Verified Property Platform</p>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
                आपकी अपनी ज़मीन, आपका अपना घर. Discover thousands of verified properties across Gurgaon, Delhi NCR, Mumbai, and Bengaluru with zero brokerage and 100% RERA compliance.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-400">
                  🛡️ RERA Certified
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-950/80 border border-amber-500/30 px-3 py-1 text-xs font-semibold text-amber-400">
                  ⭐ 4.9/5 TrustScore
                </span>
              </div>
            </div>

            {/* Popular Gurgaon Sectors */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber">Gurgaon Hotspots</h4>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                {['Sector 84, New Gurgaon', 'Golf Course Road, Sec 54', 'DLF Phase 2, Cyber Hub', 'Sector 65, Golf Ext Rd', 'Dwarka Expressway', 'Sohna Road, Sec 33'].map((item) => (
                  <li key={item}>
                    <Link to={`/properties?city=Gurgaon&search=${encodeURIComponent(item.split(',')[0])}`} className="hover:text-amber transition flex items-center gap-1.5">
                      <span className="text-amber/70">›</span> {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Top Metros */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber">Top Cities</h4>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                {['Gurgaon (1,200+ Live)', 'New Delhi', 'Noida & Greater Noida', 'Mumbai & Bandra', 'Bengaluru (Koramangala)', 'Pune & Hyderabad'].map((item) => (
                  <li key={item}>
                    <Link to={`/properties?city=${encodeURIComponent(item.split(' ')[0])}`} className="hover:text-amber transition flex items-center gap-1.5">
                      <span className="text-amber/70">›</span> {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company & Support */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber">Quick Links & Support</h4>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>
                  <Link to="/properties" className="hover:text-amber transition flex items-center gap-1.5">
                    <span className="text-amber/70">›</span> Browse All Properties
                  </Link>
                </li>
                <li>
                  <Link to="/properties/create" className="hover:text-amber transition flex items-center gap-1.5">
                    <span className="text-amber/70">›</span> List Your Property
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="hover:text-amber transition flex items-center gap-1.5">
                    <span className="text-amber/70">›</span> User Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/appointments" className="hover:text-amber transition flex items-center gap-1.5">
                    <span className="text-amber/70">›</span> Book Property Tours
                  </Link>
                </li>
                <li>
                  <a href="mailto:support@apnizameen.com" className="hover:text-amber transition flex items-center gap-1.5">
                    <span className="text-amber/70">›</span> Contact Support (Email)
                  </a>
                </li>
                <li>
                  <a href="https://haryanarera.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber transition flex items-center gap-1.5">
                    <span className="text-amber/70">›</span> Official HARERA Portal ↗
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 border-t border-slate-800/80 pt-6 flex flex-col items-center justify-between gap-4 sm:flex-row text-xs text-slate-400">
            <p>© {new Date().getFullYear()} ApniZameen Technologies Pvt. Ltd. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span>🔒 256-Bit SSL Encrypted</span>
              <span>•</span>
              <span>Govt. RERA Compliant</span>
              <span>•</span>
              <span className="text-amber">Made with ❤️ for Indian Homeowners</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
