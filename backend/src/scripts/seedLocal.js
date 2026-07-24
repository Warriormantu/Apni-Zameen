import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Property from '../models/Property.js';
import Appointment from '../models/Appointment.js';
import Message from '../models/Message.js';

dotenv.config();

const run = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is required for seeding');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Seeding database...');

  // clear
  await Promise.all([
    User.deleteMany({}),
    Property.deleteMany({}),
    Appointment.deleteMany({}),
    Message.deleteMany({}),
  ]);

  // create users
  const plainPassword = 'Password123';
  const owner = await User.create({ name: 'Owner One', email: 'owner@example.com', password: plainPassword, role: 'owner' });
  const agent = await User.create({ name: 'Agent One', email: 'agent@example.com', password: plainPassword, role: 'agent' });
  const user = await User.create({ name: 'Buyer One', email: 'buyer@example.com', password: plainPassword, role: 'user' });

  // create property
  const location = { lat: 28.6139, lng: 77.209, address: 'Test Address' };
  const property = await Property.create({
    title: 'Sample Villa',
    description: 'A lovely sample villa for testing.',
    propertyType: 'villa',
    listingType: 'sale',
    price: 7500000,
    location,
    geo: { type: 'Point', coordinates: [location.lng, location.lat] },
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
    bedrooms: 4,
    bathrooms: 3,
    area: 3200,
    amenities: ['garden', 'parking'],
    images: [],
    owner: owner._id,
    agent: agent._id,
  });

  // create appointment
  const appointment = await Appointment.create({
    user: user._id,
    property: property._id,
    date: new Date(),
    time: '10:00',
    notes: 'Looking to visit this week',
    status: 'pending',
  });

  // create message
  const message = await Message.create({
    sender: user._id,
    receiver: owner._id,
    property: property._id,
    message: 'Hi, is this still available?',
  });

  // add favorite
  user.favorites.push(property._id);
  await user.save();

  console.log('Seeding complete. Created:', { owner: owner._id, agent: agent._id, user: user._id, property: property._id, appointment: appointment._id, message: message._id });
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
