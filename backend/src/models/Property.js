import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  address: { type: String, required: true, trim: true },
});

const geoSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point',
  },
  coordinates: {
    type: [Number],
    default: [0, 0],
  },
});

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    propertyType: {
      type: String,
      enum: ['apartment', 'villa', 'house', 'commercial', 'land', 'pg', 'coliving'],
      default: 'apartment',
    },
    listingType: { type: String, enum: ['sale', 'rent'], required: true },
    price: { type: Number, required: true },
    location: {
      type: new mongoose.Schema({
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 },
        address: { type: String, required: true, trim: true },
      }),
      required: true,
    },
    geo: { type: geoSchema, required: false },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    bedrooms: { type: Number, required: true },
    bathrooms: { type: Number, required: true },
    area: { type: Number, required: true },
    amenities: [{ type: String }],
    images: [{ type: mongoose.Schema.Types.Mixed }],
    videos: [{ type: String }],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['active', 'pending', 'sold', 'rented', 'inactive'],
      default: 'active',
    },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

propertySchema.index({ status: 1, createdAt: -1 });
propertySchema.index({ status: 1, city: 1, price: 1 });
propertySchema.index({ city: 1, propertyType: 1, price: 1 });
propertySchema.index({ owner: 1, createdAt: -1 });
propertySchema.index({ agent: 1, createdAt: -1 });
propertySchema.index({ 'location.lat': 1, 'location.lng': 1 });
propertySchema.index({ geo: '2dsphere' });
propertySchema.index({ title: 'text', 'location.address': 'text', city: 'text' });

propertySchema.pre('save', function (next) {
  if (this.location && this.location.lat != null && this.location.lng != null) {
    this.geo = {
      type: 'Point',
      coordinates: [this.location.lng, this.location.lat],
    };
  }
  next();
});

const Property = mongoose.model('Property', propertySchema);
export default Property;
