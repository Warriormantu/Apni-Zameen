import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const csvPath = path.resolve(__dirname, '../../../gurgaon_10k.csv');

console.log('Starting exact analysis of gurgaon_10k.csv ...');

const stats = {
  total: 0,
  sale: 0,
  rent: 0,
  propertyTypes: {},
  bedrooms: {},
  bathrooms: {},
  hasCoords: 0,
  hasImages: 0,
  hasPrice: 0,
  minPriceSale: Infinity,
  maxPriceSale: -Infinity,
  minPriceRent: Infinity,
  maxPriceRent: -Infinity,
  sectors: {},
  sampleSale: null,
  sampleRent: null,
};

fs.createReadStream(csvPath)
  .pipe(csv())
  .on('data', (row) => {
    stats.total++;
    const propType = row.PROPERTY_TYPE || 'Unknown';
    stats.propertyTypes[propType] = (stats.propertyTypes[propType] || 0) + 1;

    const pref = (row.PREFERENCE || '').trim().toUpperCase();
    if (pref === 'S') stats.sale++;
    else if (pref === 'R') stats.rent++;

    const beds = row.BEDROOM_NUM ? Math.round(Number(row.BEDROOM_NUM)) : null;
    if (beds != null && !isNaN(beds)) {
      stats.bedrooms[beds] = (stats.bedrooms[beds] || 0) + 1;
    }

    const baths = row.BATHROOM_NUM ? Math.round(Number(row.BATHROOM_NUM)) : null;
    if (baths != null && !isNaN(baths)) {
      stats.bathrooms[baths] = (stats.bathrooms[baths] || 0) + 1;
    }

    if (row.MAP_DETAILS && row.MAP_DETAILS.includes("'LATITUDE'")) {
      stats.hasCoords++;
    }

    if (row.PROPERTY_IMAGES || row.PHOTO_URL) {
      stats.hasImages++;
    }

    const price = Number(row.MIN_PRICE) || Number(row.MAX_PRICE) || Number(row.PRICE_SQFT);
    if (price && price > 0) {
      stats.hasPrice++;
      if (pref === 'S') {
        if (price < stats.minPriceSale) stats.minPriceSale = price;
        if (price > stats.maxPriceSale) stats.maxPriceSale = price;
      } else if (pref === 'R') {
        if (price < stats.minPriceRent) stats.minPriceRent = price;
        if (price > stats.maxPriceRent) stats.maxPriceRent = price;
      }
    }

    const loc = row.LOCALITY || '';
    if (loc) {
      stats.sectors[loc] = (stats.sectors[loc] || 0) + 1;
    }

    if (pref === 'S' && !stats.sampleSale && row.MAP_DETAILS && row.PROPERTY_IMAGES) {
      stats.sampleSale = row;
    }
    if (pref === 'R' && !stats.sampleRent && row.MAP_DETAILS && row.PROPERTY_IMAGES) {
      stats.sampleRent = row;
    }
  })
  .on('end', () => {
    console.log('\n================ DATASET ANALYSIS ================');
    console.log('Total Properties Processed:', stats.total);
    console.log('For Sale (S):', stats.sale, `(${((stats.sale / stats.total) * 100).toFixed(1)}%)`);
    console.log('For Rent (R):', stats.rent, `(${((stats.rent / stats.total) * 100).toFixed(1)}%)`);
    console.log('Properties with Latitude/Longitude Coordinates:', stats.hasCoords, `(${((stats.hasCoords / stats.total) * 100).toFixed(1)}%)`);
    console.log('Properties with High-Res Images:', stats.hasImages, `(${((stats.hasImages / stats.total) * 100).toFixed(1)}%)`);
    console.log('\nPrice Range:');
    console.log(`- Sale: ₹${(stats.minPriceSale / 100000).toFixed(1)} Lakh to ₹${(stats.maxPriceSale / 10000000).toFixed(2)} Crore`);
    console.log(`- Rent: ₹${stats.minPriceRent.toLocaleString()} to ₹${stats.maxPriceRent.toLocaleString()} / month`);

    console.log('\nProperty Types:');
    console.table(stats.propertyTypes);

    console.log('\nBedrooms (BHK) Distribution:');
    console.table(stats.bedrooms);

    console.log('\nTop 15 Localities:');
    const sortedSectors = Object.entries(stats.sectors)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);
    console.table(Object.fromEntries(sortedSectors));

    console.log('\nSample Sale Property:');
    console.log({
      PROP_ID: stats.sampleSale?.PROP_ID,
      PROP_NAME: stats.sampleSale?.PROP_NAME,
      LOCALITY: stats.sampleSale?.LOCALITY,
      PRICE: stats.sampleSale?.PRICE,
      MIN_PRICE: stats.sampleSale?.MIN_PRICE,
      BEDROOM_NUM: stats.sampleSale?.BEDROOM_NUM,
      MAP_DETAILS: stats.sampleSale?.MAP_DETAILS,
      TOP_USPS: stats.sampleSale?.TOP_USPS,
    });
  });
