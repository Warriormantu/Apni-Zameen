import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [properties, setProperties] = useState([])
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const [propertiesResponse, inquiriesResponse] = await Promise.all([
        axios.get('http://localhost/apni-zameen-api/properties/user', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('http://localhost/apni-zameen-api/inquiries/user', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      setProperties(propertiesResponse.data)
      setInquiries(inquiriesResponse.data)
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch user data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>
  }

  if (error) {
    return <div className="text-center py-12 text-red-600">{error}</div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-10">
        <header>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
              Dashboard
            </h1>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            {/* Welcome Section */}
            <div className="px-4 py-8 sm:px-0">
              <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="text-xl font-semibold text-gray-900">
                  Welcome back, {user?.name}!
                </h2>
                <p className="mt-2 text-gray-600">
                  Here's an overview of your properties and inquiries.
                </p>
              </div>
            </div>

            {/* Properties Section */}
            <div className="mt-8 px-4 sm:px-0">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Your Properties</h2>
                <Link
                  to="/properties/new"
                  className="btn btn-primary"
                >
                  Add New Property
                </Link>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {properties.length > 0 ? (
                  properties.map((property) => (
                    <div key={property.id} className="rounded-lg bg-white shadow">
                      <div className="aspect-h-2 aspect-w-3">
                        <img
                          src={property.image_url || 'https://via.placeholder.com/400x300'}
                          alt={property.title}
                          className="h-full w-full object-cover rounded-t-lg"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-medium text-gray-900">{property.title}</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {property.city}, {property.state}
                        </p>
                        <p className="mt-2 text-lg font-semibold text-gray-900">
                          ₹{property.price.toLocaleString()}
                        </p>
                        <div className="mt-4 flex justify-between">
                          <Link
                            to={`/properties/${property.id}/edit`}
                            className="text-sm font-medium text-primary hover:text-primary-dark"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteProperty(property.id)}
                            className="text-sm font-medium text-red-600 hover:text-red-500"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500">You haven't listed any properties yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Inquiries Section */}
            <div className="mt-8 px-4 sm:px-0">
              <h2 className="text-xl font-semibold text-gray-900">Recent Inquiries</h2>
              <div className="mt-4 overflow-hidden rounded-lg bg-white shadow">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Property
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {inquiries.length > 0 ? (
                        inquiries.map((inquiry) => (
                          <tr key={inquiry.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {inquiry.property_title}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {inquiry.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {inquiry.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {inquiry.phone}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(inquiry.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                  inquiry.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : inquiry.status === 'contacted'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-green-100 text-green-800'
                                }`}
                              >
                                {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                            No inquiries yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 