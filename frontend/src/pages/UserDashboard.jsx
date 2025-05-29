import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import PropertyList from '../components/PropertyList';

export default function UserDashboard() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('properties');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const headers = {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      };

      // Fetch user's properties
      const propertiesResponse = await axios.get(
        'http://localhost/apni-zameen-api/properties/user',
        { headers }
      );
      setProperties(propertiesResponse.data);

      // Fetch user's inquiries
      const inquiriesResponse = await axios.get(
        'http://localhost/apni-zameen-api/inquiries/user',
        { headers }
      );
      setInquiries(inquiriesResponse.data);

      setError('');
    } catch (err) {
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this property?')) {
      return;
    }

    try {
      const headers = {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      };

      await axios.delete(
        `http://localhost/apni-zameen-api/properties/${propertyId}`,
        { headers }
      );

      setProperties(properties.filter(p => p.id !== propertyId));
    } catch (err) {
      alert('Failed to delete property');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        {user?.role === 'seller' && (
          <Link
            to="/properties/new"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Add New Property
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('properties')}
            className={`${
              activeTab === 'properties'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            My Properties
          </button>
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`${
              activeTab === 'inquiries'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            My Inquiries
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'properties' ? (
        <div>
          {properties.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">You haven't listed any properties yet.</p>
              {user?.role === 'seller' && (
                <Link
                  to="/properties/new"
                  className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  List Your First Property
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {properties.map((property) => (
                <div
                  key={property.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {property.title}
                        </h3>
                        <p className="text-gray-600 mt-1">
                          {property.city}, {property.state}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-sm font-semibold ${
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

                    <div className="mt-4 flex items-center gap-4">
                      <Link
                        to={`/properties/${property.id}`}
                        className="text-indigo-600 hover:text-indigo-700"
                      >
                        View Details
                      </Link>
                      <Link
                        to={`/properties/${property.id}/edit`}
                        className="text-gray-600 hover:text-gray-700"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteProperty(property.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {inquiries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">You haven't made any inquiries yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {inquiries.map((inquiry) => (
                <div
                  key={inquiry.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {inquiry.property_title}
                        </h3>
                        <p className="text-gray-600 mt-1">
                          Sent on {new Date(inquiry.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-sm font-semibold ${
                          inquiry.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : inquiry.status === 'responded'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {inquiry.status}
                      </span>
                    </div>

                    <div className="mt-4">
                      <p className="text-gray-700">{inquiry.message}</p>
                    </div>

                    <div className="mt-4">
                      <Link
                        to={`/properties/${inquiry.property_id}`}
                        className="text-indigo-600 hover:text-indigo-700"
                      >
                        View Property
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 