import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [users, setUsers] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('properties');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const headers = {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      };

      // Fetch all properties
      const propertiesResponse = await axios.get(
        'http://localhost/apni-zameen-api/properties',
        { headers }
      );
      setProperties(propertiesResponse.data);

      // Fetch all users
      const usersResponse = await axios.get(
        'http://localhost/apni-zameen-api/users',
        { headers }
      );
      setUsers(usersResponse.data);

      // Fetch all inquiries
      const inquiriesResponse = await axios.get(
        'http://localhost/apni-zameen-api/inquiries',
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

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const headers = {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      };

      await axios.delete(
        `http://localhost/apni-zameen-api/users/${userId}`,
        { headers }
      );

      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      const headers = {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      };

      await axios.put(
        `http://localhost/apni-zameen-api/users/${userId}`,
        { role: newRole },
        { headers }
      );

      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
    } catch (err) {
      alert('Failed to update user role');
    }
  };

  const handleUpdateInquiryStatus = async (inquiryId, newStatus) => {
    try {
      const headers = {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      };

      await axios.put(
        `http://localhost/apni-zameen-api/inquiries/${inquiryId}`,
        { status: newStatus },
        { headers }
      );

      setInquiries(inquiries.map(inquiry => 
        inquiry.id === inquiryId ? { ...inquiry, status: newStatus } : inquiry
      ));
    } catch (err) {
      alert('Failed to update inquiry status');
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

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
            Properties
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`${
              activeTab === 'users'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`${
              activeTab === 'inquiries'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Inquiries
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'properties' && (
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
                    <p className="text-gray-600 mt-1">
                      Listed by: {property.owner_name}
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

      {activeTab === 'users' && (
        <div className="grid grid-cols-1 gap-6">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {user.name}
                    </h3>
                    <p className="text-gray-600 mt-1">{user.email}</p>
                    <p className="text-gray-600 mt-1">{user.phone}</p>
                  </div>
                  <select
                    value={user.role}
                    onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="mt-4">
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete User
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'inquiries' && (
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
                      From: {inquiry.name} ({inquiry.email})
                    </p>
                    <p className="text-gray-600 mt-1">
                      Sent on {new Date(inquiry.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <select
                    value={inquiry.status}
                    onChange={(e) => handleUpdateInquiryStatus(inquiry.id, e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="responded">Responded</option>
                    <option value="closed">Closed</option>
                  </select>
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
  );
} 