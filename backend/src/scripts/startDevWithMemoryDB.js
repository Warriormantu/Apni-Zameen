import { MongoMemoryServer } from 'mongodb-memory-server';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

dotenv.config();

const run = async () => {
  console.log('Starting in-memory MongoDB...');
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGODB_URI = uri;
  console.log('In-memory MongoDB running at', uri);

  // Seed data before starting server
  await mongoose.connect(uri);

  const User = (await import('../models/User.js')).default;
  const Property = (await import('../models/Property.js')).default;
  const Appointment = (await import('../models/Appointment.js')).default;
  const Message = (await import('../models/Message.js')).default;

  // Create users
  const plainPassword = 'Password123';
  const owner = await User.create({ name: 'Rajesh Sharma', email: 'owner@example.com', password: plainPassword, role: 'owner', phone: '+91-9876543210' });
  const agent = await User.create({ name: 'Priya Mehta', email: 'agent@example.com', password: plainPassword, role: 'agent', phone: '+91-9988776655' });
  const buyer = await User.create({ name: 'Amit Kumar', email: 'buyer@example.com', password: plainPassword, role: 'user', phone: '+91-9112233445' });
  const admin = await User.create({ name: 'Admin', email: 'admin@apnizameen.com', password: plainPassword, role: 'admin' });

  // Create properties
  const properties = await Property.create([
    {
      title: 'Modern 3 BHK apartment with city views',
      description: 'A premium 3 BHK apartment located in the heart of the city with easy access to transit, schools, and shopping. Features marble flooring, modular kitchen, and 24/7 power backup.',
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
      amenities: ['Lift', 'Power Backup', 'Security', 'Parking'],
      images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'],
      owner: owner._id,
      agent: agent._id,
    },
    {
      title: 'Spacious villa with landscaped garden',
      description: 'A luxurious villa designed for family comfort, complete with private garden, gym, and covered parking. Located in the prestigious Bandra area.',
      propertyType: 'villa',
      listingType: 'sale',
      price: 32000000,
      location: { lat: 19.076, lng: 72.8777, address: 'Bandra West, Mumbai' },
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
      bedrooms: 5,
      bathrooms: 5,
      area: 5600,
      amenities: ['Swimming Pool', 'Gymnasium', 'Garden', 'Parking', 'Kids Play Area', 'Club House'],
      images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80', 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80'],
      owner: owner._id,
      agent: agent._id,
    },
    {
      title: 'Cosy 2 BHK flat in Koramangala',
      description: 'Well-maintained 2 BHK flat on the 4th floor of a gated society. Ideal for working professionals and young families. Walking distance to IT parks.',
      propertyType: 'apartment',
      listingType: 'rent',
      price: 35000,
      location: { lat: 12.9352, lng: 77.6245, address: 'Koramangala 5th Block, Bengaluru' },
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560034',
      bedrooms: 2,
      bathrooms: 2,
      area: 1100,
      amenities: ['Parking', 'Security', 'Power Backup', 'Gymnasium'],
      images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80'],
      owner: owner._id,
      agent: agent._id,
    },
    {
      title: 'Commercial office space in Cyber City',
      description: 'Premium Grade A commercial office space in the heart of Cyber City, Gurugram. Fully furnished with high-speed internet and conference rooms.',
      propertyType: 'commercial',
      listingType: 'rent',
      price: 120000,
      location: { lat: 28.4969, lng: 77.0916, address: 'DLF Cyber City, Gurugram' },
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122002',
      bedrooms: 0,
      bathrooms: 4,
      area: 3200,
      amenities: ['Parking', 'Security', 'Power Backup', 'Lift', 'Intercom'],
      images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80'],
      owner: owner._id,
      agent: agent._id,
    },
    {
      title: 'Luxury 4 BHK penthouse in Jubilee Hills',
      description: 'Stunning rooftop penthouse with panoramic city views, private terrace, and imported fittings. The pinnacle of luxury living in Hyderabad.',
      propertyType: 'apartment',
      listingType: 'sale',
      price: 45000000,
      location: { lat: 17.4325, lng: 78.4071, address: 'Jubilee Hills Road No. 36, Hyderabad' },
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500033',
      bedrooms: 4,
      bathrooms: 4,
      area: 4200,
      amenities: ['Swimming Pool', 'Gymnasium', 'Parking', 'Security', 'Club House', 'Power Backup', 'Lift'],
      images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80'],
      owner: owner._id,
      agent: agent._id,
    },
    {
      title: 'Budget 1 BHK near Andheri station',
      description: 'Affordable 1 BHK apartment just 5 minutes walk from Andheri railway station. Perfect for working professionals and bachelors.',
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
      owner: owner._id,
      agent: agent._id,
    },
  ]);

  // Load real Gurgaon dataset into in-memory database
  try {
    const { loadGurgaonProperties } = await import('./importGurgaonData.js');
    console.log('Loading real Gurgaon dataset from CSV (1,200 properties)...');
    const gurgaonProps = await loadGurgaonProperties(1200, owner._id);
    if (gurgaonProps.length > 0) {
      await Property.insertMany(gurgaonProps, { ordered: false });
      console.log(`✅ Loaded ${gurgaonProps.length} real Gurgaon properties into database.`);
    }
  } catch (err) {
    console.warn('Could not load Gurgaon CSV dataset:', err.message);
  }

  // Create appointments
  await Appointment.create([
    {
      user: buyer._id,
      property: properties[0]._id,
      date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      time: '10:00',
      notes: 'Would like to see the apartment this weekend',
      status: 'pending',
    },
    {
      user: buyer._id,
      property: properties[1]._id,
      date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      time: '14:30',
      notes: 'Interested in the villa. Please confirm.',
      status: 'accepted',
    },
  ]);

  // Create messages
  await Message.create([
    {
      sender: buyer._id,
      receiver: owner._id,
      property: properties[0]._id,
      message: 'Hi, is this 3 BHK apartment still available? I am very interested.',
    },
    {
      sender: owner._id,
      receiver: buyer._id,
      property: properties[0]._id,
      message: 'Yes, it is available! Would you like to schedule a visit?',
    },
    {
      sender: buyer._id,
      receiver: agent._id,
      property: properties[1]._id,
      message: 'Hello, can you share more details about the Bandra villa?',
    },
  ]);

  // Add a favorite
  buyer.favorites.push(properties[0]._id, properties[4]._id);
  await buyer.save();

  console.log('✅ Seed data created successfully.');
  console.log('   Login credentials:');
  console.log('   - buyer@example.com / Password123 (buyer)');
  console.log('   - owner@example.com / Password123 (owner)');
  console.log('   - agent@example.com / Password123 (agent)');

  // Keep connection open and start main server
  await import('../server.js');
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
