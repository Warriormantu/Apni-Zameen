import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.put('/users/me', {
        name: form.name,
        phone: form.phone,
      });
      if (updateUser) {
        updateUser(response.data.data);
      }
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const roleLabel = {
    user: '🏠 Buyer / Tenant',
    owner: '🔑 Property Owner',
    agent: '💼 Real Estate Agent',
    admin: '🛡️ Administrator',
  }[user?.role || 'user'];

  return (
    <div className="bg-surface min-h-[calc(100vh-68px)] py-10">
      <div className="az-container max-w-2xl">
        <div className="mb-6">
          <h1 className="font-playfair text-3xl font-bold text-primary">My Profile</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your account information and preferences.</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-700 flex items-center gap-2">
            <span>✓</span> {success}
          </div>
        )}

        <div className="rounded-card bg-white p-8 shadow-card space-y-8">
          {/* User Header / Avatar */}
          <div className="flex items-center gap-5 border-b border-surface-border pb-6">
            <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-white uppercase shadow-md">
              {(user?.name || 'U')[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary">{user?.name}</h2>
              <p className="text-xs text-gray-500">{user?.email}</p>
              <span className="mt-2 inline-block rounded-pill bg-amber-light px-3 py-1 text-xs font-semibold text-amber-dark">
                {roleLabel}
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="az-input"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                Email Address <span className="font-normal text-gray-400">(Cannot be changed)</span>
              </label>
              <input
                type="email"
                value={form.email}
                disabled
                className="az-input bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="az-input"
                placeholder="+91-9876543210"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                Account Role
              </label>
              <input
                type="text"
                value={roleLabel}
                disabled
                className="az-input bg-gray-100 text-gray-500 cursor-not-allowed capitalize"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-base justify-center font-bold"
              >
                {loading ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
