import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../hooks/useAuth'
// import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export default function PropertyDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    fetchProperty()
    if (user) {
      checkFavoriteStatus()
    }
  }, [id, user])

  const fetchProperty = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`http://localhost/apni-zameen-api/properties/${id}`)
      setProperty(response.data)
      setError('')
    } catch (err) {
      setError('Failed to fetch property details')
    } finally {
      setLoading(false)
    }
  }

  const checkFavoriteStatus = async () => {
    try {
      const response = await axios.get(
        `http://localhost/apni-zameen-api/favorites/check/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      )
      setIsFavorite(response.data.isFavorite)
    } catch (err) {
      console.error('Failed to check favorite status')
    }
  }

  const toggleFavorite = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    try {
      if (isFavorite) {
        await axios.delete(
          `http://localhost/apni-zameen-api/favorites/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        )
      } else {
        await axios.post(
          'http://localhost/apni-zameen-api/favorites',
          { property_id: id },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        )
      }
      setIsFavorite(!isFavorite)
    } catch (err) {
      alert('Failed to update favorite status')
    }
  }

  const handleInquiryChange = (e) => {
    const { name, value } = e.target
    setInquiryForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleInquirySubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(
        'http://localhost/apni-zameen-api/inquiries',
        {
          property_id: id,
          ...inquiryForm
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      )
      alert('Inquiry submitted successfully')
      setInquiryForm({
        name: '',
        email: '',
        phone: '',
        message: ''
      })
    } catch (err) {
      alert('Failed to submit inquiry')
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this property?')) {
      return
    }

    try {
      await axios.delete(`http://localhost/apni-zameen-api/properties/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      navigate('/properties')
    } catch (err) {
      alert('Failed to delete property')
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-600">Property not found</p>
        </div>
      </div>
    )
  }

  const mapContainerStyle = {
    width: '100%',
    height: '400px'
  }

  const center = {
    lat: parseFloat(property.latitude) || 0,
    lng: parseFloat(property.longitude) || 0
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Image Gallery */}
      <div className="mb-8">
        <div className="relative aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
          {property.images && property.images.length > 0 ? (
            <img
              src={`http://localhost/apni-zameen-api/${property.images[activeImageIndex].image_path}`}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No images available</span>
            </div>
          )}
        </div>

        {/* Thumbnail Navigation */}
        {property.images && property.images.length > 1 && (
          <div className="mt-4 grid grid-cols-5 gap-2">
            {property.images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setActiveImageIndex(index)}
                className={`relative aspect-w-1 aspect-h-1 rounded-lg overflow-hidden ${
                  activeImageIndex === index ? 'ring-2 ring-indigo-500' : ''
                }`}
              >
                <img
                  src={`http://localhost/apni-zameen-api/${image.image_path}`}
                  alt={`${property.title} - Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Property Details */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
                  <p className="mt-2 text-2xl font-semibold text-indigo-600">
                    ₹{property.price.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={toggleFavorite}
                    className={`p-2 rounded-full ${
                      isFavorite ? 'text-red-500' : 'text-gray-400'
                    } hover:text-red-500 transition-colors`}
                  >
                    <svg
                      className="w-6 h-6"
                      fill={isFavorite ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </button>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      property.status === 'available'
                        ? 'bg-green-100 text-green-800'
                        : property.status === 'sold'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {property.status}
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {property.bedrooms && (
                  <div>
                    <p className="text-sm text-gray-500">Bedrooms</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {property.bedrooms}
                    </p>
                  </div>
                )}
                {property.bathrooms && (
                  <div>
                    <p className="text-sm text-gray-500">Bathrooms</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {property.bathrooms}
                    </p>
                  </div>
                )}
                {property.area && (
                  <div>
                    <p className="text-sm text-gray-500">Area</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {property.area} sq ft
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {property.property_type}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h2 className="text-lg font-medium text-gray-900">Description</h2>
                <p className="mt-2 text-gray-600">{property.description}</p>
              </div>

              <div className="mt-6">
                <h2 className="text-lg font-medium text-gray-900">Location</h2>
                <p className="mt-2 text-gray-600">
                  {property.address}, {property.city}, {property.state} {property.zip_code}
                </p>
              </div>

              {/* Google Maps */}
              {property.latitude && property.longitude && (
                <div className="mt-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Location Map</h2>
                  <div style={{ height: '400px', width: '100%' }}>
                    {GOOGLE_MAPS_API_KEY ? (
                      <div>Map will be shown here when Google Maps API key is provided.</div>
                    ) : (
                      <div
                        style={{
                          height: '100%',
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: '#f3f4f6',
                          color: '#6b7280',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                        }}
                      >
                        Map feature coming in a future update.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Owner Actions */}
              {user && (user.id === property.user_id || user.role === 'admin') && (
                <div className="mt-6 flex items-center gap-4">
                  <Link
                    to={`/properties/${id}/edit`}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Edit Property
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Delete Property
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Contact Owner</h2>
              <form onSubmit={handleInquirySubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={inquiryForm.name}
                    onChange={handleInquiryChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={inquiryForm.email}
                    onChange={handleInquiryChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={inquiryForm.phone}
                    onChange={handleInquiryChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    required
                    value={inquiryForm.message}
                    onChange={handleInquiryChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Send Inquiry
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 