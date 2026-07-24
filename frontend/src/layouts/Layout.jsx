import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-slate-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="text-xl font-semibold text-slate-900">
            ApniZameen
          </Link>
          <nav className="flex items-center gap-4 text-sm text-slate-700">
            <Link to="/properties">Properties</Link>
            {user && <Link to="/dashboard">Dashboard</Link>}
            {user && <Link to="/favorites">Favorites</Link>}
            {user && <Link to="/appointments">Appointments</Link>}
            {user && <Link to="/messages">Messages</Link>}
            {user && <Link to="/properties/create" className="rounded-md bg-slate-900 px-3 py-2 text-white">List Property</Link>}
            {user ? (
              <>
                <span className="text-slate-700">{user.name}</span>
                <button onClick={logout} className="rounded-md bg-slate-900 px-3 py-2 text-white">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register" className="rounded-md bg-slate-900 px-3 py-2 text-white">
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 text-sm text-slate-600 sm:px-6">
          © 2026 ApniZameen. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
