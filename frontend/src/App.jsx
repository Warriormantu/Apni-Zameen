import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import PropertiesPage from './pages/PropertiesPage.jsx';
import PropertyDetailsPage from './pages/PropertyDetailsPage.jsx';
import CreatePropertyPage from './pages/CreatePropertyPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import FavoritesPage from './pages/FavoritesPage.jsx';
import AppointmentsPage from './pages/AppointmentsPage.jsx';
import MessagesPage from './pages/MessagesPage.jsx';
import Layout from './layouts/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

function App() {
  return (
    <Layout>
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
      </Routes>
    </Layout>
  );
}

export default App;
