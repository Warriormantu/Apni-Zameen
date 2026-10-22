import { useEffect, useState } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const AppointmentsPage = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/appointments');
      setAppointments(response.data.data.items || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    setError(null);
    try {
      await api.patch(`/appointments/${id}`, { status });
      await loadAppointments();
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to update appointment');
    }
  };

  const statusColor = (status) => {
    if (status === 'accepted') return 'bg-rera-light text-rera';
    if (status === 'rejected' || status === 'cancelled') return 'bg-red-50 text-red-500';
    return 'bg-amber-light text-amber-dark';
  };

  return (
    <div className="bg-surface min-h-screen">
      <div className="az-container py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-playfair text-3xl font-bold text-primary">My Appointments</h1>
            <p className="mt-1 text-sm text-gray-500">Monitor visit requests and update their status.</p>
          </div>
          <span className="rounded-pill bg-amber-light px-4 py-2 text-sm font-semibold text-amber-dark">
            {appointments.length} Total
          </span>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="animate-pulse rounded-card bg-white p-6 shadow-card">
                <div className="h-5 w-1/3 rounded bg-gray-200 mb-3" />
                <div className="h-4 w-1/4 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <div className="rounded-card bg-white py-16 text-center shadow-card">
            <div className="text-5xl mb-3">📅</div>
            <h3 className="font-playfair text-xl font-bold text-primary">No Appointments Yet</h3>
            <p className="mt-2 text-sm text-gray-500">Request a site visit from a property page.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment._id} className="rounded-card bg-white p-6 shadow-card">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center text-xl">🏠</div>
                      <div>
                        <h2 className="font-playfair text-lg font-semibold text-primary">
                          {appointment.property?.title || 'Property'}
                        </h2>
                        <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-600">
                          <span>📅 {appointment.date ? new Date(appointment.date).toLocaleDateString() : '—'} at {appointment.time || '—'}</span>
                          {appointment.notes && <span>📝 {appointment.notes}</span>}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                          {appointment.user?.name && <span>Buyer: <span className="font-semibold text-primary">{appointment.user.name}</span></span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`rounded-pill px-3 py-1.5 text-xs font-bold capitalize ${statusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>

                    <div className="flex gap-2">
                      {user.role === 'user' ? (
                        appointment.status !== 'cancelled' && (
                          <button
                            onClick={() => handleUpdateStatus(appointment._id, 'cancelled')}
                            className="btn-outline text-xs text-red-600 border-red-200 hover:bg-red-50 px-4 py-2"
                          >
                            Cancel
                          </button>
                        )
                      ) : (
                        <>
                          {appointment.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(appointment._id, 'accepted')}
                                className="btn-primary text-xs px-4 py-2 bg-rera hover:bg-rera"
                              >
                                ✓ Accept
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(appointment._id, 'rejected')}
                                className="btn-outline text-xs px-4 py-2 text-red-600 border-red-200 hover:bg-red-50"
                              >
                                ✗ Reject
                              </button>
                            </>
                          )}
                          {appointment.status !== 'cancelled' && (
                            <button
                              onClick={() => handleUpdateStatus(appointment._id, 'cancelled')}
                              className="text-xs text-gray-400 hover:text-red-500 transition px-2"
                            >
                              Cancel
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsPage;
