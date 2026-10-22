import test from 'node:test';
import assert from 'node:assert/strict';
import { getValidatedImageExtension } from '../src/controllers/uploadController.js';
import { propertyIdParamSchema, propertyUpdateSchema } from '../src/validators/schemas.js';

test('--- TASK 1 UNIT & SECURITY TESTS ---', async (t) => {
  await t.test('1. Image validation: Accepts authentic JPEG buffer and returns .jpg', () => {
    // Valid JPEG magic header: FF D8 FF E0 ...
    const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00]);
    const ext = getValidatedImageExtension(jpegBuffer, 'image/jpeg');
    assert.strictEqual(ext, '.jpg', 'Should identify valid JPEG and return .jpg');
  });

  await t.test('2. Image validation: Accepts authentic PNG buffer and returns .png', () => {
    // Valid PNG magic header: 89 50 4E 47 0D 0A 1A 0A ...
    const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48]);
    const ext = getValidatedImageExtension(pngBuffer, 'image/png');
    assert.strictEqual(ext, '.png', 'Should identify valid PNG and return .png');
  });

  await t.test('3. Image validation: Accepts authentic WebP buffer and returns .webp', () => {
    // Valid WebP magic header: RIFF (bytes 0-3) and WEBP (bytes 8-11)
    const webpBuffer = Buffer.from([
      0x52, 0x49, 0x46, 0x46, // 'RIFF'
      0x24, 0x00, 0x00, 0x00, // length
      0x57, 0x45, 0x42, 0x50, // 'WEBP'
      0x56, 0x50, 0x38, 0x20  // 'VP8 '
    ]);
    const ext = getValidatedImageExtension(webpBuffer, 'image/webp');
    assert.strictEqual(ext, '.webp', 'Should identify valid WebP and return .webp');
  });

  await t.test('4. Image validation: Rejects HTML/script disguised as image/jpeg', () => {
    const maliciousHtml = Buffer.from('<script>alert("XSS")</script><html><body>Evil Payload</body></html>');
    const ext = getValidatedImageExtension(maliciousHtml, 'image/jpeg');
    assert.strictEqual(ext, null, 'Should reject non-JPEG buffer even if user sent image/jpeg MIME type');
  });

  await t.test('5. Image validation: Rejects SVG image/svg+xml buffer', () => {
    const svgBuffer = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
    const ext = getValidatedImageExtension(svgBuffer, 'image/svg+xml');
    assert.strictEqual(ext, null, 'Should reject SVG buffers to prevent stored XSS');
  });

  await t.test('6. Image validation: Rejects truncated or empty buffers', () => {
    const shortBuffer = Buffer.from([0xff, 0xd8]);
    assert.strictEqual(getValidatedImageExtension(shortBuffer, 'image/jpeg'), null);
    assert.strictEqual(getValidatedImageExtension(null, 'image/jpeg'), null);
  });

  await t.test('7. Property ID Schema: Accepts valid 24-hex ObjectId string', () => {
    const validId = '507f1f77bcf86cd799439011';
    const result = propertyIdParamSchema.safeParse({ params: { id: validId } });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.data.params.id, validId);
  });

  await t.test('8. Property ID Schema: Rejects invalid ID formats', () => {
    const invalidIds = ['invalid-id', '123', '507f1f77bcf86cd79943901z', '', '!@#$%^'];
    for (const badId of invalidIds) {
      const result = propertyIdParamSchema.safeParse({ params: { id: badId } });
      assert.strictEqual(result.success, false, `ID '${badId}' should have been rejected`);
    }
  });

  await t.test('9. Mass Assignment Protection: Rejects unauthorized fields (owner, views, _id)', () => {
    const payloadWithOwner = {
      body: {
        title: 'Updated Penthouse',
        price: 9500000,
        owner: '507f1f77bcf86cd799439099', // Unauthorized field!
      },
    };
    const resOwner = propertyUpdateSchema.safeParse(payloadWithOwner);
    assert.strictEqual(resOwner.success, false, 'Should reject update payload containing owner');

    const payloadWithViews = {
      body: {
        title: 'Updated Penthouse',
        views: 1000000, // Unauthorized internal field!
      },
    };
    const resViews = propertyUpdateSchema.safeParse(payloadWithViews);
    assert.strictEqual(resViews.success, false, 'Should reject update payload containing views');
  });

  await t.test('10. Property Update Schema: Successfully validates approved editable fields', () => {
    const validUpdate = {
      body: {
        title: 'Updated Luxury Villa in Sector 84',
        price: 12500000,
        description: 'Updated description for luxury villa with modern amenities.',
        bedrooms: 4,
        bathrooms: 4,
        status: 'active',
        amenities: ['Gymnasium', 'Swimming Pool', 'Security'],
      },
    };
    const result = propertyUpdateSchema.safeParse(validUpdate);
    assert.strictEqual(result.success, true, 'Valid update fields should be parsed without error');
    assert.strictEqual(result.data.body.title, 'Updated Luxury Villa in Sector 84');
    assert.strictEqual(result.data.body.price, 12500000);
  });
});

test('--- TASK 1 LIVE HTTP API INTEGRATION TESTS ---', async (t) => {
  const BASE_URL = 'http://localhost:5000/api/v1';

  await t.test('11. HTTP GET /properties/:id rejects invalid ID format with HTTP 400', async () => {
    const res = await fetch(`${BASE_URL}/properties/invalid-id-xyz`);
    const data = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.success, false);
    assert.match(data.error, /Invalid property ID format/);
  });

  await t.test('12. HTTP GET /properties/:id returns 404 for valid-format non-existent ID', async () => {
    const res = await fetch(`${BASE_URL}/properties/507f1f77bcf86cd799439011`);
    const data = await res.json();
    assert.strictEqual(res.status, 404);
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.error, 'Property not found');
  });

  await t.test('13. HTTP PUT /properties/:id blocks unauthorized fields (owner/views) with 400', async () => {
    // Log in as property owner
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner@example.com', password: 'Password123' }),
    });
    const loginData = await loginRes.json();
    assert.strictEqual(loginRes.status, 200, 'Owner should be able to log in');
    const token = loginData.data.token;

    // Fetch an existing property owned by this owner
    const mineRes = await fetch(`${BASE_URL}/properties/mine`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const mineData = await mineRes.json();
    assert.strictEqual(mineRes.status, 200);
    assert.ok(mineData.data.length > 0, 'Should have at least one property for owner');
    const propertyId = mineData.data[0]._id;

    // Attempt mass assignment: overwrite owner and views
    const updateRes = await fetch(`${BASE_URL}/properties/${propertyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: 'Hacked Title',
        owner: '507f1f77bcf86cd799439099', // Malicious owner override
        views: 999999, // Malicious views override
      }),
    });
    const updateData = await updateRes.json();
    assert.strictEqual(updateRes.status, 400, 'Server must reject unauthorized keys with HTTP 400');
    assert.strictEqual(updateData.success, false);
    assert.match(updateData.error, /Unauthorized fields present/);
  });

  await t.test('14. HTTP PUT /properties/:id accepts approved editable fields and persists changes', async () => {
    // Log in as property owner
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner@example.com', password: 'Password123' }),
    });
    const loginData = await loginRes.json();
    const token = loginData.data.token;

    const mineRes = await fetch(`${BASE_URL}/properties/mine`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const mineData = await mineRes.json();
    const propertyId = mineData.data[0]._id;

    const newTitle = `Verified Luxury Suite - Updated ${Date.now()}`;
    const newPrice = 8800000;

    const updateRes = await fetch(`${BASE_URL}/properties/${propertyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: newTitle,
        price: newPrice,
      }),
    });
    const updateData = await updateRes.json();
    assert.strictEqual(updateRes.status, 200);
    assert.strictEqual(updateData.success, true);
    assert.strictEqual(updateData.data.title, newTitle);
    assert.strictEqual(updateData.data.price, newPrice);
  });

  await t.test('15. HTTP PUT /properties/:id rejects update by unauthorized non-owner with 403', async () => {
    // Register or log in as a separate buyer user
    const buyerEmail = `test_buyer_${Date.now()}@example.com`;
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Buyer',
        email: buyerEmail,
        password: 'Password123',
        role: 'user',
      }),
    });
    const regData = await regRes.json();
    assert.strictEqual(regRes.status, 201);
    const buyerToken = regData.data.token;

    // Get a property owned by owner@example.com
    const propRes = await fetch(`${BASE_URL}/properties?limit=1`);
    const propData = await propRes.json();
    const targetPropertyId = propData.data.items[0]._id;

    // Buyer tries to update owner's property
    const updateRes = await fetch(`${BASE_URL}/properties/${targetPropertyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${buyerToken}`,
      },
      body: JSON.stringify({
        title: 'Unauthorized Modification',
        price: 100,
      }),
    });
    const updateData = await updateRes.json();
    assert.strictEqual(updateRes.status, 403, 'Must return 403 Forbidden for non-owner');
    assert.strictEqual(updateData.success, false);
    assert.strictEqual(updateData.error, 'Forbidden');
  });
});
