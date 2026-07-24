import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';

const DashboardPage = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const [favoritesRes, appointmentsRes, messagesRes] = await Promise.all([
          api.get('/favorites'),
          api.get('/appointments'),
          api.get('/messages'),
        ]);

        setFavorites(favoritesRes.data.data || []);
        setAppointments(appointmentsRes.data.data.items || []);
        setMessages(messagesRes.data.data.items || []);
      } catch (err) {
        setError(err.response?.data?.error || 'Unable to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const appointmentSummary = useMemo(() => {
    return appointments.reduce(
      (acc, appointment) => {
        acc[appointment.status] = (acc[appointment.status] || 0) + 1;
        return acc;
      },
      { pending: 0, accepted: 0, rejected: 0, rescheduled: 0, cancelled: 0 }
    );
  }, [appointments]);

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-3 text-slate-600">Welcome back, {user.name}. Here is a quick view of your activity.</p>
      </div>

      {error && <div className="rounded-3xl bg-rose-50 p-6 text-sm text-rose-700">{error}</div>}

      {loading ? (
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm">Loading dashboard...</div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Quick stats</h2>
            <div className="mt-6 space-y-4 text-sm text-slate-600">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span>Total favorites</span>
                <span className="font-semibold text-slate-900">{favorites.length}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span>Total appointments</span>
                <span className="font-semibold text-slate-900">{appointments.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total messages</span>
                <span className="font-semibold text-slate-900">{messages.length}</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Appointment status</h2>
            <div className="mt-6 grid gap-3 text-sm text-slate-600">
              {Object.entries(appointmentSummary).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="capitalize">{status}</span>
                  <span className="font-semibold text-slate-900">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Quick links</h2>
            <div className="mt-6 flex flex-col gap-3 text-sm">
              <Link to="/properties" className="rounded-2xl bg-slate-900 px-4 py-3 text-white text-center">Browse properties</Link>
              <Link to="/favorites" className="rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 text-center">Your favorites</Link>
              <Link to="/appointments" className="rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 text-center">Manage appointments</Link>
              <Link to="/messages" className="rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 text-center">View messages</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
