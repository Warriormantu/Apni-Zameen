import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const csvPath = path.resolve(__dirname, '../../../gurgaon_10k.csv');

console.log('Reading CSV from:', csvPath);

// Fast CSV parser handling quotes and newlines
function parseCSV(content, limit = 50) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentField);
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentField);
      if (currentRow.length > 1 || currentRow[0] !== '') {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
      if (limit && rows.length >= limit) break;
    } else {
      currentField += char;
    }
  }
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }
  return rows;
}

try {
  // Read first 2MB to get header and sample rows
  const fd = fs.openSync(csvPath, 'r');
  const buffer = Buffer.alloc(1024 * 1024 * 3); // 3MB
  const bytesRead = fs.readSync(fd, buffer, 0, buffer.length, 0);
  fs.closeSync(fd);

  const sampleContent = buffer.toString('utf-8', 0, bytesRead);
  const rows = parseCSV(sampleContent, 30);
  const headers = rows[0];

  console.log('Total headers:', headers.length);
  console.log('Headers:', headers);
  console.log('Sample parsed rows:', rows.length - 1);

  if (rows.length > 1) {
    const sample = rows[1];
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = sample[idx];
    });
    console.log('\nSample Row 1 breakdown:');
    console.log({
      PROP_ID: obj.PROP_ID,
      PROP_NAME: obj.PROP_NAME,
      PROPERTY_TYPE: obj.PROPERTY_TYPE,
      PREFERENCE: obj.PREFERENCE,
      BEDROOM_NUM: obj.BEDROOM_NUM,
      BATHROOM_NUM: obj.BATHROOM_NUM,
      MIN_PRICE: obj.MIN_PRICE,
      MAX_PRICE: obj.MAX_PRICE,
      PRICE: obj.PRICE,
      LOCALITY: obj.LOCALITY,
      MAP_DETAILS: obj.MAP_DETAILS,
      TOP_USPS: obj.TOP_USPS,
      PROPERTY_IMAGES: obj.PROPERTY_IMAGES,
      CONTACT_NAME: obj.CONTACT_NAME,
      CONTACT_COMPANY_NAME: obj.CONTACT_COMPANY_NAME,
    });
  }
} catch (err) {
  console.error('Error analyzing CSV:', err);
}
