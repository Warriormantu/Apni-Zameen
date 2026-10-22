import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Route-level code splitting: download page bundles only when navigated to
const HomePage = lazy(() => import('./pages/HomePage.jsx'));
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const RegisterPage = lazy(() => import('./pages/RegisterPage.jsx'));
const PropertiesPage = lazy(() => import('./pages/PropertiesPage.jsx'));
const PropertyDetailsPage = lazy(() => import('./pages/PropertyDetailsPage.jsx'));
const CreatePropertyPage = lazy(() => import('./pages/CreatePropertyPage.jsx'));
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage.jsx'));
const AppointmentsPage = lazy(() => import('./pages/AppointmentsPage.jsx'));
const MessagesPage = lazy(() => import('./pages/MessagesPage.jsx'));
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'));

// Lightweight, smooth loading placeholder
const PageLoadingFallback = () => (
  <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-amber" />
    <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">ApniZameen Loading...</span>
  </div>
);

function App() {
  return (
    <Layout>
      <Suspense fallback={<PageLoadingFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/properties/:id" element={<PropertyDetailsPage />} />
          <Route path="/properties/create" element={<ProtectedRoute><CreatePropertyPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
          <Route path="/appointments" element={<ProtectedRoute><AppointmentsPage /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

export default App;
