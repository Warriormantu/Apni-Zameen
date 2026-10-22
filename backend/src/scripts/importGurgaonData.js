import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import { fileURLToPath } from 'url';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const csvPath = path.resolve(__dirname, '../../../gurgaon_10k.csv');

// Curated high-res Unsplash real estate image fallbacks by property type
export const PROPERTY_FALLBACK_IMAGES = {
  apartment: [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80',
  ],
  villa: [
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',
  ],
  house: [
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200&q=80',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&q=80',
  ],
  commercial: [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80',
  ],
  land: [
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80',
  ],
};

export function transformRow(row, defaultOwnerId, index = 0) {
  // 1. Property Type mapping
  const rawType = (row.PROPERTY_TYPE || '').trim();
  let propertyType = 'apartment';
  if (rawType.includes('Villa') || rawType.includes('House')) {
    propertyType = 'villa';
  } else if (rawType.includes('Land') || rawType.includes('Plot')) {
    propertyType = 'land';
  } else if (rawType.includes('Commercial')) {
    propertyType = 'commercial';
  } else if (rawType.includes('Builder Floor')) {
    propertyType = 'apartment';
  }

  // 2. Listing Type
  const pref = (row.PREFERENCE || '').trim().toUpperCase();
  const listingType = pref === 'R' ? 'rent' : 'sale';

  // 3. Price
  let price = Number(row.MIN_PRICE) || Number(row.MAX_PRICE) || 0;
  if (!price && row.PRICE) {
    const pStr = row.PRICE.toString().replace(/,/g, '').trim();
    if (pStr.includes('Cr')) {
      price = parseFloat(pStr) * 10000000;
    } else if (pStr.includes('L') || pStr.includes('Lac')) {
      price = parseFloat(pStr) * 100000;
    } else {
      price = parseFloat(pStr) || 0;
    }
  }
  if (!price || price <= 0) {
    price = listingType === 'rent' ? 35000 : 7500000;
  }

  // 4. Bedrooms / Bathrooms / Area
  const bedrooms = Math.max(0, Math.round(Number(row.BEDROOM_NUM)) || (propertyType === 'land' ? 0 : 2));
  const bathrooms = Math.max(1, Math.round(Number(row.BATHROOM_NUM)) || Math.max(1, bedrooms));
  let area = Number(row.SUPERBUILTUP_SQFT) || Number(row.CARPET_SQFT) || Number(row.MIN_AREA_SQFT);
  if (!area && row.AREA) {
    area = parseFloat(row.AREA.replace(/[^0-9.]/g, ''));
  }
  if (!area || area <= 0) {
    area = bedrooms > 0 ? bedrooms * 550 : 1200;
  }

  // 5. Geolocation Coordinates from MAP_DETAILS
  let lat = 28.4595 + (Math.sin(index) * 0.05); // Gurgaon base with small natural dispersion fallback
  let lng = 77.0266 + (Math.cos(index) * 0.05);
  if (row.MAP_DETAILS) {
    const latMatch = row.MAP_DETAILS.match(/'LATITUDE':\s*'([0-9.]+)'/i);
    const lngMatch = row.MAP_DETAILS.match(/'LONGITUDE':\s*'([0-9.]+)'/i);
    if (latMatch && lngMatch) {
      const pLat = parseFloat(latMatch[1]);
      const pLng = parseFloat(lngMatch[1]);
      if (!isNaN(pLat) && !isNaN(pLng) && pLat > 25 && pLat < 30 && pLng > 75 && pLng < 79) {
        lat = pLat;
        lng = pLng;
      }
    }
  }

  // 6. Locality & Address
  const locality = (row.LOCALITY || 'Sector 84 Gurgaon').replace(/Gurgaon/i, '').trim();
  const propName = (row.PROP_NAME || row.BUILDING_NAME || row.SOCIETY_NAME || '').trim();
  const address = propName
    ? `${propName}, ${locality || 'Sector 84'}, Gurgaon`
    : `${locality || 'Sector 84'}, Gurgaon`;

  // 7. Title
  let title = (row.PROP_HEADING || '').trim();
  if (!title || title.length < 5) {
    title = `${bedrooms > 0 ? `${bedrooms} BHK ` : ''}${propName || locality || 'Property'} for ${listingType === 'sale' ? 'Sale' : 'Rent'}`;
  }

  // 8. Description
  let description = (row.DESCRIPTION || '').trim();
  if (description.length < 25) {
    description = `Premium ${bedrooms > 0 ? `${bedrooms} BHK ` : ''}${propertyType} available for ${listingType} in ${address}. Located in a prime area of Gurgaon with high connectivity, modern amenities, and 24/7 security.`;
  }

  // 9. Amenities (from TOP_USPS and standard)
  const amenities = [];
  if (row.TOP_USPS) {
    const uspsMatches = row.TOP_USPS.match(/'([^']+)'/g);
    if (uspsMatches) {
      uspsMatches.forEach((m) => {
        const item = m.replace(/'/g, '').trim();
        if (item.length > 2 && item.length < 35) amenities.push(item);
      });
    }
  }
  ['Gated Society', 'Power Backup', 'Security', 'Parking', 'Lift'].forEach((am) => {
    if (!amenities.includes(am) && amenities.length < 6) {
      amenities.push(am);
    }
  });

  // 10. Images: Reliable CDN + High-Res Fallbacks
  const images = [];
  const fallbackList = PROPERTY_FALLBACK_IMAGES[propertyType] || PROPERTY_FALLBACK_IMAGES.apartment;
  const fallbackImg = fallbackList[index % fallbackList.length];

  // Try parsing PROPERTY_IMAGES
  if (row.PROPERTY_IMAGES) {
    const imgMatches = row.PROPERTY_IMAGES.match(/'(https:\/\/[^']+)'/g);
    if (imgMatches && imgMatches.length > 0) {
      imgMatches.slice(0, 3).forEach((m) => {
        const url = m.replace(/'/g, '').trim();
        images.push(url);
      });
    }
  }
  if (images.length === 0 && row.PHOTO_URL) {
    images.push(row.PHOTO_URL);
  }
  // Always append high-res fallback image so if CDN image fails, fallback is present
  images.push(fallbackImg);

  return {
    title: title.slice(0, 150),
    description,
    propertyType,
    listingType,
    price: Math.round(price),
    location: {
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
      address,
    },
    geo: {
      type: 'Point',
      coordinates: [Number(lng.toFixed(6)), Number(lat.toFixed(6))],
    },
    city: 'Gurgaon',
    state: 'Haryana',
    pincode: '122001',
    bedrooms,
    bathrooms,
    area: Math.round(area),
    amenities: amenities.slice(0, 8),
    images,
    owner: defaultOwnerId,
    status: 'active',
    views: Math.floor(Math.random() * 50) + 5,
  };
}

export async function loadGurgaonProperties(limit = 1000, defaultOwnerId) {
  return new Promise((resolve, reject) => {
    const properties = [];
    let count = 0;

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        if (limit && count >= limit) return;
        try {
          const prop = transformRow(row, defaultOwnerId, count);
          properties.push(prop);
          count++;
        } catch (err) {
          // skip invalid row
        }
      })
      .on('end', () => {
        console.log(`Loaded and transformed ${properties.length} Gurgaon properties from CSV`);
        resolve(properties);
      })
      .on('error', reject);
  });
}

// Standalone execution
if (process.argv[1] && process.argv[1].endsWith('importGurgaonData.js')) {
  const runStandalone = async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/apnizameen';
    console.log('Connecting to MongoDB:', mongoUri);
    await mongoose.connect(mongoUri);

    const User = (await import('../models/User.js')).default;
    const Property = (await import('../models/Property.js')).default;

    let owner = await User.findOne({ email: 'owner@example.com' });
    if (!owner) {
      owner = await User.create({
        name: 'Rajesh Sharma',
        email: 'owner@example.com',
        password: 'Password123',
        role: 'owner',
        phone: '+91-9876543210',
      });
    }

    const limitArg = process.argv[2] ? parseInt(process.argv[2]) : 2000;
    console.log(`Importing up to ${limitArg} properties into MongoDB...`);
    const properties = await loadGurgaonProperties(limitArg, owner._id);

    // Insert in batches of 500
    const batchSize = 500;
    let inserted = 0;
    for (let i = 0; i < properties.length; i += batchSize) {
      const batch = properties.slice(i, i + batchSize);
      await Property.insertMany(batch, { ordered: false });
      inserted += batch.length;
      console.log(`Inserted ${inserted} / ${properties.length} properties...`);
    }

    console.log(`✅ Successfully imported ${inserted} Gurgaon properties into database!`);
    await mongoose.disconnect();
    process.exit(0);
  };

  runStandalone().catch((err) => {
    console.error('Import failed:', err);
    process.exit(1);
  });
}

