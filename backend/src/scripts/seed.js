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
        images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'],
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
        amenities: ['Gym', 'Garden', 'Parking', 'Swimming Pool', 'Kids Play Area'],
        images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80', 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80'],
        videos: [],
        owner: owner._id,
        agent: agent._id,
      },
      {
        title: 'Cosy 2 BHK flat in Koramangala',
        description: 'Well-maintained 2 BHK flat on the 4th floor of a gated society. Ideal for working professionals and young families.',
        propertyType: 'apartment',
        listingType: 'rent',
        price: 35000,
        location: { lat: 12.9352, lng: 77.6245, address: 'Koramangala, Bengaluru' },
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560034',
        bedrooms: 2,
        bathrooms: 2,
        area: 1100,
        amenities: ['Parking', 'Security', 'Power Backup', 'Gym'],
        images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80'],
        videos: [],
        owner: owner._id,
        agent: agent._id,
      },
      {
        title: 'Commercial office space in Cyber City',
        description: 'Premium Grade A commercial office space in the heart of Cyber City, Gurugram. Fully furnished with high-speed internet.',
        propertyType: 'commercial',
        listingType: 'rent',
        price: 120000,
        location: { lat: 28.4969, lng: 77.0916, address: 'Cyber City, Gurugram' },
        city: 'Gurugram',
        state: 'Haryana',
        pincode: '122002',
        bedrooms: 0,
        bathrooms: 4,
        area: 3200,
        amenities: ['Parking', 'Security', 'Power Backup', 'Lift', 'Intercom'],
        images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80'],
        videos: [],
        owner: owner._id,
        agent: agent._id,
      },
      {
        title: 'Luxury 4 BHK penthouse in Jubilee Hills',
        description: 'Stunning rooftop penthouse with panoramic city views, private terrace, and imported fittings. The pinnacle of luxury living.',
        propertyType: 'apartment',
        listingType: 'sale',
        price: 45000000,
        location: { lat: 17.4325, lng: 78.4071, address: 'Jubilee Hills, Hyderabad' },
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500033',
        bedrooms: 4,
        bathrooms: 4,
        area: 4200,
        amenities: ['Swimming Pool', 'Gymnasium', 'Parking', 'Security', 'Club House', 'Power Backup', 'Lift'],
        images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80'],
        videos: [],
        owner: owner._id,
        agent: agent._id,
      },
      {
        title: 'Budget 1 BHK near Andheri station',
        description: 'Affordable 1 BHK apartment just 5 minutes walk from Andheri railway station. Perfect for working professionals.',
        propertyType: 'apartment',
        listingType: 'rent',
        price: 22000,
        location: { lat: 19.1136, lng: 72.8697, address: 'Andheri East, Mumbai' },
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400069',
        bedrooms: 1,
        bathrooms: 1,
        area: 550,
        amenities: ['Security', 'Lift'],
        images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'],
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
