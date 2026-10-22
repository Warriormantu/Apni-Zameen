import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const csvPath = path.resolve(__dirname, '../../../gurgaon_10k.csv');

console.log('Analyzing gurgaon_10k.csv ...');

async function analyze() {
  const fileStream = fs.createReadStream(csvPath, { encoding: 'utf-8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let lineCount = 0;
  let header = null;
  let headerIndices = {};
  const propTypes = {};
  const preferences = {};
  const bedroomCounts = {};
  const sectors = {};
  let totalWithCoords = 0;
  let totalWithImages = 0;
  let totalRows = 0;
  let minPrice = Infinity;
  let maxPrice = -Infinity;

  // Multi-line CSV record collector
  let recordBuffer = '';
  let inQuotes = false;

  for await (const line of rl) {
    lineCount++;
    if (!header) {
      // First line is header
      header = line.split(',');
      header.forEach((h, idx) => {
        headerIndices[h.trim()] = idx;
      });
      continue;
    }

    // Check quotes balance
    let quoteCount = 0;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') quoteCount++;
    }

    if (!inQuotes) {
      if (quoteCount % 2 === 1) {
        inQuotes = true;
        recordBuffer = line;
        continue;
      } else {
        recordBuffer = line;
      }
    } else {
      recordBuffer += '\n' + line;
      if (quoteCount % 2 === 1) {
        inQuotes = false;
      } else {
        continue;
      }
    }

    totalRows++;

    // Extract quick regex patterns from recordBuffer
    // Or parse CSV row
    const propTypeMatch = recordBuffer.match(/,(Residential Apartment|Independent House\/Villa|Independent Builder Floor|Plot \/ Land|Serviced Apartment|Studio Apartment|Farm House|Commercial)/i);
    const propType = propTypeMatch ? propTypeMatch[1] : 'Other';
    propTypes[propType] = (propTypes[propType] || 0) + 1;

    if (recordBuffer.includes("'LATITUDE'")) {
      totalWithCoords++;
    }
    if (recordBuffer.includes('https://mediacdn.99acres.com')) {
      totalWithImages++;
    }

    const localityMatch = recordBuffer.match(/,(Sector\s+\d+[A-Za-z]?\s+Gurgaon|Sohna Sector\s+\d+|Golf Course Road|Cyber City|Sohna Road)/i);
    if (localityMatch) {
      const loc = localityMatch[1];
      sectors[loc] = (sectors[loc] || 0) + 1;
    }

    if (totalRows % 2000 === 0) {
      console.log(`Processed ${totalRows} rows...`);
    }
  }

  console.log('\n--- DATASET ANALYSIS SUMMARY ---');
  console.log('Total Raw Lines:', lineCount);
  console.log('Total Parsed Property Records:', totalRows);
  console.log('Total with Geolocation Coordinates:', totalWithCoords, `(${((totalWithCoords/totalRows)*100).toFixed(1)}%)`);
  console.log('Total with Media CDN Images:', totalWithImages, `(${((totalWithImages/totalRows)*100).toFixed(1)}%)`);
  console.log('\nProperty Types breakdown:');
  console.table(propTypes);
  console.log('\nTop Sectors / Localities:');
  const topSectors = Object.entries(sectors).sort((a,b) => b[1] - a[1]).slice(0, 15);
  console.table(Object.fromEntries(topSectors));
}

analyze().catch(console.error);
