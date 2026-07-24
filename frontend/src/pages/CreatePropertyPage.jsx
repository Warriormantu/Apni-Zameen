import { useState } from 'react';
import api from '../services/api.js';
import { useNavigate } from 'react-router-dom';

const CreatePropertyPage = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    propertyType: 'apartment',
    listingType: 'sale',
    price: '',
    location: { lat: '', lng: '', address: '' },
    city: '',
    state: '',
    pincode: '',
    bedrooms: 1,
    bathrooms: 1,
    area: '',
    amenities: '',
    images: [],
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('location.')) {
      const key = name.split('.')[1];
      setForm((prev) => ({ ...prev, location: { ...prev.location, [key]: value } }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      let images = [];
      if (form.images.length > 0) {
        setUploading(true);
        const formData = new FormData();
        form.images.forEach((file) => formData.append('images', file));
        const uploadResponse = await api.post('/uploads/images', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        images = uploadResponse.data.data;
      }

      const payload = {
        title: form.title,
        description: form.description,
        propertyType: form.propertyType,
        listingType: form.listingType,
        price: Number(form.price),
        location: {
          lat: Number(form.location.lat),
          lng: Number(form.location.lng),
          address: form.location.address,
        },
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        area: Number(form.area),
        amenities: form.amenities.split(',').map((item) => item.trim()).filter(Boolean),
        images,
      };

      await api.post('/properties', payload);
      setSuccess('Property created successfully.');
      navigate('/properties');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not create property');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-lg">
      <h1 className="text-2xl font-semibold">Create a new property</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {error && <div className="rounded-2xl bg-red-100 px-4 py-3 text-sm text-red-700">{error}</div>}
        {success && <div className="rounded-2xl bg-emerald-100 px-4 py-3 text-sm text-emerald-700">{success}</div>}
        <div className="grid gap-6 md:grid-cols-2">
          <label className="block">
            <span className="text-sm text-slate-700">Title</span>
            <input name="title" value={form.title} onChange={handleChange} className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3" required />
          </label>
          <label className="block">
            <span className="text-sm text-slate-700">Price</span>
            <input name="price" type="number" value={form.price} onChange={handleChange} className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3" required />
          </label>
        </div>
        <div>
          <label className="block text-sm text-slate-700">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows="4" className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3" required />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <label className="block">
            <span className="text-sm text-slate-700">Listing</span>
            <select name="listingType" value={form.listingType} onChange={handleChange} className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3">
              <option value="sale">Sale</option>
              <option value="rent">Rent</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-slate-700">Type</span>
            <select name="propertyType" value={form.propertyType} onChange={handleChange} className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3">
              <option value="apartment">Apartment</option>
              <option value="villa">Villa</option>
              <option value="house">House</option>
              <option value="commercial">Commercial</option>
              <option value="land">Land</option>
              <option value="pg">PG</option>
              <option value="coliving">Co-living</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-slate-700">Area (sqft)</span>
            <input name="area" type="number" value={form.area} onChange={handleChange} className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3" required />
          </label>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <label className="block">
            <span className="text-sm text-slate-700">Bedrooms</span>
            <input name="bedrooms" type="number" value={form.bedrooms} onChange={handleChange} className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3" required />
          </label>
          <label className="block">
            <span className="text-sm text-slate-700">Bathrooms</span>
            <input name="bathrooms" type="number" value={form.bathrooms} onChange={handleChange} className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3" required />
          </label>
          <label className="block">
            <span className="text-sm text-slate-700">Amenities</span>
            <input name="amenities" value={form.amenities} onChange={handleChange} placeholder="Comma separated" className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3" />
          </label>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <label className="block">
            <span className="text-sm text-slate-700">City</span>
            <input name="city" value={form.city} onChange={handleChange} className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3" required />
          </label>
          <label className="block">
            <span className="text-sm text-slate-700">State</span>
            <input name="state" value={form.state} onChange={handleChange} className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3" required />
          </label>
          <label className="block">
            <span className="text-sm text-slate-700">Pincode</span>
            <input name="pincode" value={form.pincode} onChange={handleChange} className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3" required />
          </label>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <label className="block">
            <span className="text-sm text-slate-700">Address</span>
            <input name="location.address" value={form.location.address} onChange={handleChange} className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3" required />
          </label>
          <label className="block">
            <span className="text-sm text-slate-700">Latitude</span>
            <input name="location.lat" type="number" value={form.location.lat} onChange={handleChange} className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3" required />
          </label>
          <label className="block">
            <span className="text-sm text-slate-700">Longitude</span>
            <input name="location.lng" type="number" value={form.location.lng} onChange={handleChange} className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3" required />
          </label>
        </div>
        <div>
          <label className="block text-sm text-slate-700">Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setForm((prev) => ({ ...prev, images: Array.from(e.target.files) }))}
            className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3"
          />
          {form.images.length > 0 && (
            <p className="mt-2 text-sm text-slate-600">{form.images.length} files selected</p>
          )}
        </div>
        <button type="submit" disabled={uploading} className="w-full rounded-2xl bg-slate-900 px-6 py-3 text-white disabled:opacity-60">
          {uploading ? 'Uploading...' : 'Create property'}
        </button>
      </form>
    </div>
  );
};

export default CreatePropertyPage;
