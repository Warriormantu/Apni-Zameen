import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const PropertyDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageSuccess, setMessageSuccess] = useState(null);
  const [appointmentData, setAppointmentData] = useState({ date: '', time: '', notes: '' });
  const [appointmentSuccess, setAppointmentSuccess] = useState(null);
  const [error, setError] = useState(null);

  const loadProperty = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/properties/${id}`);
      setProperty(response.data.data);
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

  useEffect(() => {
    loadProperty();
  }, [id]);

  useEffect(() => {
    loadFavoriteState();
  }, [user, id]);

  const toggleFavorite = async () => {
    if (!user) return;
    setFavoriteLoading(true);
    try {
      await api.post(`/favorites/${id}`);
      setIsFavorite((prev) => !prev);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to update favorite');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!user || !property) return;
    const receiverId = property.agent?._id || property.owner?._id;
    if (!receiverId) {
      setError('No receiver available for this property');
      return;
    }
    try {
      const payload = {
        property: id,
        receiver: receiverId,
        message: messageText,
      };
      await api.post('/messages', payload);
      setMessageSuccess('Message sent successfully.');
      setMessageText('');
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to send message');
      setMessageSuccess(null);
    }
  };

  const requestAppointment = async () => {
    if (!user || !property) return;
    try {
      const payload = {
        property: id,
        date: appointmentData.date,
        time: appointmentData.time,
        notes: appointmentData.notes,
      };
      await api.post('/appointments', payload);
      setAppointmentSuccess('Appointment requested successfully.');
      setAppointmentData({ date: '', time: '', notes: '' });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to request appointment');
      setAppointmentSuccess(null);
    }
  };

  if (loading) return <div className="rounded-3xl bg-white p-8 shadow-sm">Loading...</div>;
  if (!property) return <div className="rounded-3xl bg-white p-8 shadow-sm">Property not found.</div>;

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">{property.title}</h1>
            <p className="mt-3 text-slate-600">{property.location.address}</p>
          </div>
          <div className="rounded-3xl bg-slate-100 px-6 py-4 text-slate-900">
            <p className="text-sm uppercase text-slate-500">{property.listingType} • {property.propertyType}</p>
            <p className="mt-2 text-3xl font-semibold">₹{property.price.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {error && <div className="rounded-3xl bg-rose-50 p-6 text-sm text-rose-700">{error}</div>}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-3xl bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold">Overview</h2>
          <p className="mt-4 text-slate-600">{property.description}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Bedrooms</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">{property.bedrooms}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Bathrooms</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">{property.bathrooms}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Area</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">{property.area} sqft</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Status</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">{property.status}</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">City</p>
              <p className="mt-2 text-slate-900">{property.city}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">State</p>
              <p className="mt-2 text-slate-900">{property.state}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold">Owner</h2>
          <p className="mt-4 text-slate-600">{property.owner?.name || property.agent?.name || 'Owner/Agent details not available'}</p>
          <div className="mt-6 space-y-3">
            {user ? (
              <>
                <button
                  onClick={toggleFavorite}
                  disabled={favoriteLoading}
                  className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-white"
                >
                  {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                </button>
                <button
                  onClick={requestAppointment}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900"
                >
                  Request Visit
                </button>
              </>
            ) : (
              <Link to="/login" className="block rounded-2xl bg-slate-900 px-4 py-3 text-center text-white">
                Login to contact owner
              </Link>
            )}
          </div>

          {user && (
            <div className="mt-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Send a message</h3>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  rows="4"
                  className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  placeholder="Write a message to the owner or agent"
                />
                <button
                  onClick={sendMessage}
                  className="mt-4 inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-white"
                >
                  Send Message
                </button>
                {messageSuccess && <p className="mt-3 text-sm text-emerald-700">{messageSuccess}</p>}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900">Request a visit</h3>
                <div className="mt-3 space-y-4">
                  <input
                    type="date"
                    value={appointmentData.date}
                    onChange={(e) => setAppointmentData((prev) => ({ ...prev, date: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  />
                  <input
                    type="time"
                    value={appointmentData.time}
                    onChange={(e) => setAppointmentData((prev) => ({ ...prev, time: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  />
                  <textarea
                    value={appointmentData.notes}
                    onChange={(e) => setAppointmentData((prev) => ({ ...prev, notes: e.target.value }))}
                    rows="3"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                    placeholder="Optional notes for the visit request"
                  />
                  <button
                    onClick={requestAppointment}
                    className="w-full rounded-2xl bg-emerald-100 px-4 py-3 font-semibold text-emerald-700"
                  >
                    Request Appointment
                  </button>
                  {appointmentSuccess && <p className="text-sm text-emerald-700">{appointmentSuccess}</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsPage;
