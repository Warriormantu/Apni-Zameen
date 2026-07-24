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

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Appointments</h1>
        <p className="mt-3 text-slate-600">Manage your schedule and respond to booking requests.</p>
      </div>

      {error && <div className="rounded-3xl bg-rose-50 p-6 text-sm text-rose-700">{error}</div>}

      {loading ? (
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm">Loading appointments...</div>
      ) : appointments.length === 0 ? (
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm">No appointments found.</div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div key={appointment._id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">{appointment.property?.title || 'Property'}</h2>
                  <p className="mt-2 text-sm text-slate-600">Date: {new Date(appointment.date).toLocaleDateString()} at {appointment.time}</p>
                  <p className="mt-1 text-sm text-slate-600">Status: <span className="font-semibold text-slate-900">{appointment.status}</span></p>
                  <p className="mt-1 text-sm text-slate-500">{appointment.notes || 'No notes provided.'}</p>
                </div>
                <div className="space-y-2 text-sm text-slate-600">
                  {user.role === 'user' ? (
                    appointment.status !== 'cancelled' && (
                      <button
                        onClick={() => handleUpdateStatus(appointment._id, 'cancelled')}
                        className="rounded-2xl bg-rose-100 px-4 py-2 font-semibold text-rose-700"
                      >
                        Cancel request
                      </button>
                    )
                  ) : (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(appointment._id, 'accepted')}
                        className="rounded-2xl bg-emerald-100 px-4 py-2 font-semibold text-emerald-700"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(appointment._id, 'rejected')}
                        className="rounded-2xl bg-amber-100 px-4 py-2 font-semibold text-amber-700"
                      >
                        Reject
                      </button>
                      {appointment.status !== 'cancelled' && (
                        <button
                          onClick={() => handleUpdateStatus(appointment._id, 'cancelled')}
                          className="rounded-2xl bg-rose-100 px-4 py-2 font-semibold text-rose-700"
                        >
                          Cancel
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm text-slate-600">
                <div>
                  <span className="font-semibold text-slate-900">Buyer:</span> {appointment.user?.name || 'N/A'}
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Listed by:</span> {appointment.property?.owner?.name || appointment.property?.agent?.name || 'N/A'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;
