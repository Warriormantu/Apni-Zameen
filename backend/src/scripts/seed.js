import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Property from '../models/Property.js';
import connectDB from '../config/db.js';

dotenv.config();

const seed = async () => {
  try {
    await connectDB();
    await User.deleteMany();
    await Property.deleteMany();

    const password = await bcrypt.hash('Test1234!', 10);
    const users = await User.create([
      { name: 'Admin', email: 'admin@apnizameen.com', password, role: 'admin' },
      { name: 'Owner One', email: 'owner1@apnizameen.com', password, role: 'owner' },
      { name: 'Agent One', email: 'agent1@apnizameen.com', password, role: 'agent' },
      { name: 'Buyer One', email: 'user1@apnizameen.com', password, role: 'user' },
    ]);

    const owner = users.find((u) => u.role === 'owner');
    const agent = users.find((u) => u.role === 'agent');

    await Property.create([
      {
        title: 'Modern 3 BHK apartment with city views',
        description: 'A premium 3 BHK apartment located in the heart of the city with easy access to transit, schools, and shopping.',
        propertyType: 'apartment',
        listingType: 'sale',
        price: 9500000,
        location: { lat: 28.6139, lng: 77.209, address: 'Connaught Place, New Delhi' },
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
        bedrooms: 3,
        bathrooms: 3,
        area: 1850,
        amenities: ['Lift', 'Power Backup', 'Security'],
        images: [],
        videos: [],
        owner: owner._id,
        agent: agent._id,
      },
      {
        title: 'Spacious villa with landscaped garden',
        description: 'A luxurious villa designed for family comfort, complete with private garden, gym, and covered parking.',
        propertyType: 'villa',
        listingType: 'sale',
        price: 32000000,
        location: { lat: 19.076, lng: 72.8777, address: 'Bandra, Mumbai' },
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400050',
        bedrooms: 5,
        bathrooms: 5,
        area: 5600,
        amenities: ['Gym', 'Garden', 'Parking'],
        images: [],
        videos: [],
        owner: owner._id,
        agent: agent._id,
      },
    ]);

    console.log('Seed data created successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
