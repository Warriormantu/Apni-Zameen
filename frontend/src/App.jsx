import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from './hooks/useAuth'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import SEO from './components/SEO'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Properties from './pages/Properties'
import PropertyDetails from './pages/PropertyDetails'
import NewProperty from './pages/NewProperty'
import EditProperty from './pages/EditProperty'
import UserDashboard from './pages/UserDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Favorites from './pages/Favorites'

function App() {
  return (
    <HelmetProvider>
      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <SEO />
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/properties/:id" element={<PropertyDetails />} />
              
              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['buyer', 'seller']}>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/properties/new"
                element={
                  <ProtectedRoute allowedRoles={['seller']}>
                    <NewProperty />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/properties/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['seller']}>
                    <EditProperty />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/favorites"
                element={
                  <ProtectedRoute allowedRoles={['buyer', 'seller']}>
                    <Favorites />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </AuthProvider>
      </Router>
    </HelmetProvider>
  )
}

export default App
