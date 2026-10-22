import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';

const StatCard = ({ icon, label, value, delta, color }) => (
  <div className="stat-card flex items-start gap-4">
    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl ${color || 'bg-primary/10'}`}>
      {icon}
    </div>
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-primary">{value}</p>
      {delta && <p className="mt-0.5 text-xs text-rera">{delta}</p>}
    </div>
  </div>
);

const formatPrice = (price) => {
  if (!price) return '—';
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
  return `₹${price.toLocaleString()}`;
};

const DashboardPage = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [myProperties, setMyProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const [favSettled, apptSettled, msgSettled, propsSettled] = await Promise.allSettled([
          api.get('/favorites'),
          api.get('/appointments'),
          api.get('/messages'),
          api.get('/properties/mine'),
        ]);
        if (favSettled.status === 'fulfilled') {
          setFavorites(favSettled.value.data?.data || []);
        }
        if (apptSettled.status === 'fulfilled') {
          setAppointments(apptSettled.value.data?.data?.items || []);
        }
        if (msgSettled.status === 'fulfilled') {
          setMessages(msgSettled.value.data?.data?.items || []);
        }
        if (propsSettled.status === 'fulfilled') {
          setMyProperties(propsSettled.value.data?.data || []);
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Unable to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const pendingAppointments = useMemo(
    () => appointments.filter((a) => a.status === 'pending').length,
    [appointments]
  );

  const unreadMessages = messages.filter((m) => m.sender?._id !== user?._id).length;

  return (
    <div className="bg-surface min-h-screen">
      <div className="az-container py-8 space-y-8">
        {/* ── Welcome header ── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-playfair text-3xl font-bold text-primary">
              Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Here's an overview of your activity on ApniZameen.
            </p>
          </div>
          <Link to="/properties/create" className="btn-amber shrink-0 gap-2">
            + List Property
          </Link>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* ── KPI Cards ── */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon="🏠"
            label="Saved Properties"
            value={loading ? '—' : favorites.length}
            delta={favorites.length > 0 ? `${favorites.length} in wishlist` : null}
            color="bg-blue-50"
          />
          <StatCard
            icon="📅"
            label="Appointments"
            value={loading ? '—' : appointments.length}
            delta={pendingAppointments > 0 ? `${pendingAppointments} pending` : null}
            color="bg-amber-light"
          />
          <StatCard
            icon="💬"
            label="Messages"
            value={loading ? '—' : messages.length}
            delta={unreadMessages > 0 ? `${unreadMessages} from agents` : null}
            color="bg-rera-light"
          />
          <StatCard
            icon="📋"
            label="My Listings"
            value={loading ? '—' : myProperties.length}
            delta={myProperties.length > 0 ? `${myProperties.length} published` : null}
            color="bg-purple-50"
          />
        </div>

        {loading ? (
          <div className="grid gap-6 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-card bg-white h-48 shadow-card" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* ── Left Column: Saved Properties & My Listings ── */}
            <div className="lg:col-span-2 space-y-6">
              {/* Saved Properties */}
              <div className="rounded-card bg-white p-6 shadow-card">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-playfair text-xl font-bold text-primary">Saved Properties</h2>
                  <Link to="/favorites" className="text-xs font-semibold text-amber hover:text-amber-dark transition">
                    View All →
                  </Link>
                </div>

                {favorites.length === 0 ? (
                  <div className="rounded-lg bg-surface py-8 text-center">
                    <p className="text-4xl mb-2">❤️</p>
                    <p className="text-sm text-gray-500">No saved properties yet.</p>
                    <Link to="/properties" className="btn-primary mt-3 inline-flex text-xs px-4 py-2">
                      Browse Properties
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {favorites.slice(0, 3).map((prop) => (
                      <Link
                        key={prop._id}
                        to={`/properties/${prop._id}`}
                        className="flex items-center gap-4 rounded-lg border border-surface-border p-3 transition hover:border-amber hover:bg-surface"
                      >
                        <div className="h-14 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {prop.images?.[0] ? (
                            <img
                              src={prop.images[0].url || prop.images[0]}
                              alt={prop.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-2xl">🏢</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-primary truncate">{prop.title}</p>
                          <p className="text-xs text-gray-500">{prop.city}, {prop.state}</p>
                        </div>
                        <p className="text-price text-sm text-primary shrink-0">{formatPrice(prop.price)}</p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* My Listed Properties */}
              {myProperties.length > 0 && (
                <div className="rounded-card bg-white p-6 shadow-card">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="font-playfair text-xl font-bold text-primary">My Listed Properties</h2>
                      <p className="text-xs text-gray-500">Properties you have published on ApniZameen</p>
                    </div>
                    <Link to="/properties/create" className="btn-amber text-xs px-3 py-1.5 font-bold">
                      + Add New
                    </Link>
                  </div>

                  <div className="space-y-3">
                    {myProperties.map((prop) => (
                      <div
                        key={prop._id}
                        className="flex items-center justify-between gap-4 rounded-lg border border-surface-border p-3 transition hover:border-amber"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-12 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                            {prop.images?.[0] ? (
                              <img
                                src={prop.images[0].url || prop.images[0]}
                                alt={prop.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-xl">🏢</div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link to={`/properties/${prop._id}`} className="text-sm font-semibold text-primary truncate block hover:text-amber">
                              {prop.title}
                            </Link>
                            <p className="text-xs text-gray-500">{prop.city} • {formatPrice(prop.price)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="rounded-pill bg-rera-light px-2.5 py-0.5 text-xs font-semibold text-rera capitalize">
                            {prop.status || 'Active'}
                          </span>
                          <Link to={`/properties/${prop._id}`} className="btn-ghost text-xs px-3 py-1">
                            View →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Sidebar: Messages + Appointments ── */}
            <div className="space-y-4">
              {/* Recent Messages */}
              <div className="rounded-card bg-white p-5 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-playfair text-lg font-bold text-primary">Recent Messages</h2>
                  {unreadMessages > 0 && (
                    <span className="rounded-pill bg-amber px-2 py-0.5 text-xs font-bold text-primary">
                      {unreadMessages} New
                    </span>
                  )}
                </div>

                {messages.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">No messages yet.</p>
                ) : (
                  <div className="space-y-3">
                    {messages.slice(0, 3).map((msg) => {
                      const other = msg.sender?._id === user?._id ? msg.receiver : msg.sender;
                      return (
                        <div key={msg._id} className="flex items-start gap-3">
                          <div className="h-9 w-9 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary uppercase">
                            {(other?.name || 'A')[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-primary">{other?.name || 'Agent'}</p>
                            <p className="text-xs text-gray-500 truncate">{msg.message}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <Link to="/messages" className="mt-4 block text-center text-xs font-semibold text-primary hover:text-amber transition">
                  View All Messages →
                </Link>
              </div>

              {/* Upcoming Appointments */}
              <div className="rounded-card bg-white p-5 shadow-card">
                <h2 className="font-playfair text-lg font-bold text-primary mb-4">Appointments</h2>
                {appointments.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">No appointments yet.</p>
                ) : (
                  <div className="space-y-2">
                    {appointments.slice(0, 3).map((appt) => (
                      <div key={appt._id} className="flex items-center justify-between rounded-lg bg-surface px-3 py-2.5">
                        <div>
                          <p className="text-xs font-semibold text-primary truncate max-w-[130px]">
                            {appt.property?.title || 'Property'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {appt.date ? new Date(appt.date).toLocaleDateString() : '—'}
                          </p>
                        </div>
                        <span className={`rounded-pill px-2.5 py-1 text-xs font-semibold capitalize ${
                          appt.status === 'accepted' ? 'bg-rera-light text-rera' :
                          appt.status === 'rejected' ? 'bg-red-50 text-red-500' :
                          'bg-amber-light text-amber-dark'
                        }`}>
                          {appt.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <Link to="/appointments" className="mt-4 block text-center text-xs font-semibold text-primary hover:text-amber transition">
                  View All Appointments →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── Quick Actions ── */}
        <div className="rounded-card bg-primary p-6 shadow-card">
          <h2 className="font-playfair text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { to: '/properties', label: '🔍 Browse Properties', desc: 'Find your next home' },
              { to: '/favorites', label: '❤️ My Wishlist', desc: `${favorites.length} saved` },
              { to: '/appointments', label: '📅 Appointments', desc: `${appointments.length} total` },
              { to: '/messages', label: '💬 Messages', desc: `${messages.length} conversations` },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-lg bg-white/10 px-4 py-3.5 text-white transition hover:bg-white/20 hover:scale-[1.02]"
              >
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="mt-0.5 text-xs text-blue-200">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
