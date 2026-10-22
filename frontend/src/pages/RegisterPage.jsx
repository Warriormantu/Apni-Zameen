import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const roles = [
  { value: 'user', label: '🏠 Buyer', desc: 'Looking to buy or rent' },
  { value: 'owner', label: '🔑 Owner', desc: 'List your property' },
  { value: 'agent', label: '💼 Agent', desc: 'Manage client listings' },
];

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register(form);
      navigate('/properties');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-68px)]">
      {/* ── Left: Atmospheric Photo ── */}
      <div className="relative hidden w-1/2 overflow-hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=85"
          alt="Modern Real Estate"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-transparent" />
        <div className="absolute bottom-12 left-10 right-10">
          <h2 className="font-playfair text-4xl font-bold leading-tight text-white">
            Your Dream Home Awaits.
          </h2>
          <p className="mt-3 text-base text-white/80 leading-relaxed">
            Register today and access thousands of RERA-verified properties across India.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3">
            {['50,000+ Listings', '200+ Cities', 'Zero Brokerage', 'RERA Verified'].map((tag) => (
              <span key={tag} className="flex items-center gap-1.5 rounded-lg bg-white/15 px-4 py-2.5 text-xs font-medium text-white backdrop-blur-sm">
                ✓ {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: Register Form ── */}
      <div className="flex flex-1 items-center justify-center bg-surface-low px-6 py-12 lg:px-16">
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-white p-8 shadow-card sm:p-10">
            {/* Logo */}
            <div className="mb-6 text-center">
              <span className="font-playfair text-3xl font-bold text-primary">
                Apni<span className="text-amber">Zameen</span>
              </span>
              <p className="mt-2 text-sm text-gray-500">Create your free account and start your journey.</p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Role selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">I am a</label>
                <div className="grid grid-cols-3 gap-2">
                  {roles.map((role) => (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => setForm({ ...form, role: role.value })}
                      className={`flex flex-col items-center gap-1 rounded-lg border-2 py-3 px-2 text-center transition ${
                        form.role === role.value
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-surface-border text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-lg">{role.label.split(' ')[0]}</span>
                      <span className="text-xs font-semibold">{role.label.split(' ')[1]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Full Name</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="az-input"
                  placeholder="Your full name"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Email Address</label>
                <input
                  id="reg-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="az-input"
                  placeholder="name@example.com"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Password</label>
                <input
                  id="reg-password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="az-input"
                  placeholder="Min. 8 characters"
                  required
                />
              </div>

              <p className="text-xs text-gray-400">
                By registering, you agree to our{' '}
                <a href="#" className="text-primary hover:text-amber transition">Terms of Service</a>{' '}
                and{' '}
                <a href="#" className="text-primary hover:text-amber transition">Privacy Policy</a>.
              </p>

              <button
                id="register-btn"
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 text-base font-bold"
              >
                {loading ? 'Creating Account...' : 'Create Account →'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-primary hover:text-amber transition">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
