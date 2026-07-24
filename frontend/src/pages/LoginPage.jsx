import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form);
      navigate('/properties');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-lg">
      <h1 className="text-2xl font-semibold">Login to ApniZameen</h1>
      <p className="mt-2 text-slate-600">Access your saved properties and manage listings.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {error && <div className="rounded-2xl bg-red-100 px-4 py-3 text-sm text-red-700">{error}</div>}
        <div>
          <label className="block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3"
            required
          />
        </div>
        <button type="submit" className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-white">
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
