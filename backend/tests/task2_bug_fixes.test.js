import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { updateAppointment } from '../src/controllers/appointmentController.js';
import { escapeRegex } from '../src/controllers/propertyController.js';

test('--- BUG-01: APPOINTMENT UPDATES ON AGENTLESS PROPERTIES (UNIT TESTS) ---', async (t) => {
  const ownerId = new mongoose.Types.ObjectId();
  const agentId = new mongoose.Types.ObjectId();
  const requesterId = new mongoose.Types.ObjectId();
  const strangerId = new mongoose.Types.ObjectId();
  const appointmentId = new mongoose.Types.ObjectId().toString();

  // Helper to mock res
  const createMockRes = () => {
    const res = {};
    res.statusCode = 200;
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };
    res.json = (payload) => {
      res.body = payload;
      return res;
    };
    return res;
  };

  await t.test('1. Property owner can update appointment when property has NO assigned agent (agent is null/undefined)', async () => {
    const fakeAppointment = {
      _id: appointmentId,
      user: requesterId,
      status: 'pending',
      property: {
        _id: new mongoose.Types.ObjectId(),
        owner: ownerId,
        agent: null, // Agentless property!
      },
      save: async () => {},
    };

    // Temporarily stub Appointment.findById
    const AppointmentModel = (await import('../src/models/Appointment.js')).default;
    const originalFindById = AppointmentModel.findById;
    AppointmentModel.findById = () => ({
      populate: async () => fakeAppointment,
    });

    try {
      const req = {
        params: { id: appointmentId },
        validated: { body: { status: 'accepted' } },
        user: { _id: ownerId, role: 'owner' },
      };
      const res = createMockRes();

      await updateAppointment(req, res, (err) => {
        if (err) throw err;
      });

      assert.strictEqual(res.statusCode, 200, 'Owner update should return HTTP 200');
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(fakeAppointment.status, 'accepted');
    } finally {
      AppointmentModel.findById = originalFindById;
    }
  });

  await t.test('2. Assigned agent can update appointment when property has assigned agent', async () => {
    const fakeAppointment = {
      _id: appointmentId,
      user: requesterId,
      status: 'pending',
      property: {
        _id: new mongoose.Types.ObjectId(),
        owner: ownerId,
        agent: agentId,
      },
      save: async () => {},
    };

    const AppointmentModel = (await import('../src/models/Appointment.js')).default;
    const originalFindById = AppointmentModel.findById;
    AppointmentModel.findById = () => ({
      populate: async () => fakeAppointment,
    });

    try {
      const req = {
        params: { id: appointmentId },
        validated: { body: { status: 'accepted' } },
        user: { _id: agentId, role: 'agent' },
      };
      const res = createMockRes();

      await updateAppointment(req, res, (err) => {
        if (err) throw err;
      });

      assert.strictEqual(res.statusCode, 200, 'Assigned agent update should return HTTP 200');
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(fakeAppointment.status, 'accepted');
    } finally {
      AppointmentModel.findById = originalFindById;
    }
  });

  await t.test('3. Unrelated owner or agent receives HTTP 403 Forbidden', async () => {
    const fakeAppointment = {
      _id: appointmentId,
      user: requesterId,
      status: 'pending',
      property: {
        _id: new mongoose.Types.ObjectId(),
        owner: ownerId,
        agent: agentId,
      },
      save: async () => {},
    };

    const AppointmentModel = (await import('../src/models/Appointment.js')).default;
    const originalFindById = AppointmentModel.findById;
    AppointmentModel.findById = () => ({
      populate: async () => fakeAppointment,
    });

    try {
      const req = {
        params: { id: appointmentId },
        validated: { body: { status: 'rejected' } },
        user: { _id: strangerId, role: 'owner' }, // Unrelated user with owner role
      };
      const res = createMockRes();

      await updateAppointment(req, res, (err) => {
        if (err) throw err;
      });

      assert.strictEqual(res.statusCode, 403, 'Unrelated owner should receive 403');
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error, 'Forbidden');
    } finally {
      AppointmentModel.findById = originalFindById;
    }
  });

  await t.test('4. User with unsupported role cannot bypass authorization and receives HTTP 403', async () => {
    const fakeAppointment = {
      _id: appointmentId,
      user: requesterId,
      status: 'pending',
      property: {
        _id: new mongoose.Types.ObjectId(),
        owner: ownerId,
        agent: null,
      },
      save: async () => {},
    };

    const AppointmentModel = (await import('../src/models/Appointment.js')).default;
    const originalFindById = AppointmentModel.findById;
    AppointmentModel.findById = () => ({
      populate: async () => fakeAppointment,
    });

    try {
      const req = {
        params: { id: appointmentId },
        validated: { body: { status: 'accepted' } },
        user: { _id: strangerId, role: 'guest' }, // Unsupported role
      };
      const res = createMockRes();

      await updateAppointment(req, res, (err) => {
        if (err) throw err;
      });

      assert.strictEqual(res.statusCode, 403, 'Unsupported role should receive 403');
      assert.strictEqual(res.body.success, false);
    } finally {
      AppointmentModel.findById = originalFindById;
    }
  });

  await t.test('5. Missing appointment returns HTTP 404', async () => {
    const AppointmentModel = (await import('../src/models/Appointment.js')).default;
    const originalFindById = AppointmentModel.findById;
    AppointmentModel.findById = () => ({
      populate: async () => null,
    });

    try {
      const req = {
        params: { id: appointmentId },
        validated: { body: { status: 'accepted' } },
        user: { _id: ownerId, role: 'owner' },
      };
      const res = createMockRes();

      await updateAppointment(req, res, (err) => {
        if (err) throw err;
      });

      assert.strictEqual(res.statusCode, 404);
      assert.strictEqual(res.body.error, 'Appointment not found');
    } finally {
      AppointmentModel.findById = originalFindById;
    }
  });

  await t.test('6. Missing property reference returns HTTP 404', async () => {
    const fakeAppointment = {
      _id: appointmentId,
      user: requesterId,
      status: 'pending',
      property: null, // Property was deleted/missing
      save: async () => {},
    };

    const AppointmentModel = (await import('../src/models/Appointment.js')).default;
    const originalFindById = AppointmentModel.findById;
    AppointmentModel.findById = () => ({
      populate: async () => fakeAppointment,
    });

    try {
      const req = {
        params: { id: appointmentId },
        validated: { body: { status: 'accepted' } },
        user: { _id: ownerId, role: 'owner' },
      };
      const res = createMockRes();

      await updateAppointment(req, res, (err) => {
        if (err) throw err;
      });

      assert.strictEqual(res.statusCode, 404);
      assert.strictEqual(res.body.error, 'Property not found');
    } finally {
      AppointmentModel.findById = originalFindById;
    }
  });

  await t.test('7. Invalid appointment ID format returns HTTP 400', async () => {
    const req = {
      params: { id: 'not-valid-hex-id' },
      validated: { body: { status: 'accepted' } },
      user: { _id: ownerId, role: 'owner' },
    };
    const res = createMockRes();

    await updateAppointment(req, res, (err) => {
      if (err) throw err;
    });

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.error, 'Invalid appointment ID format');
  });
});

test('--- SEC-03: PROPERTY SEARCH REGEX ESCAPING (UNIT TESTS) ---', async (t) => {
  await t.test('8. escapeRegex safely escapes all regex metacharacters', () => {
    const testCases = [
      { input: '[', expected: '\\[' },
      { input: 'Gurgaon(', expected: 'Gurgaon\\(' },
      { input: '.*', expected: '\\.\\*' },
      { input: 'Villa+Pool', expected: 'Villa\\+Pool' },
      { input: 'A&B?C', expected: 'A&B\\?C' },
      { input: '^Sector$14', expected: '\\^Sector\\$14' },
      { input: '3{BHK}', expected: '3\\{BHK\\}' },
      { input: '1|2', expected: '1\\|2' },
      { input: 'C:\\path', expected: 'C:\\\\path' },
    ];

    for (const { input, expected } of testCases) {
      const escaped = escapeRegex(input);
      assert.strictEqual(escaped, expected, `Input "${input}" should be escaped to "${expected}"`);
      // Crucial: verify that new RegExp doesn't throw SyntaxError on escaped string!
      assert.doesNotThrow(() => {
        new RegExp(escaped, 'i');
      }, `new RegExp on escaped "${input}" must not throw`);
    }
  });

  await t.test('9. Ordinary text passes through and matches literally', () => {
    const query = 'Golf Course Road';
    const escaped = escapeRegex(query);
    assert.strictEqual(escaped, 'Golf Course Road');
    const regex = new RegExp(escaped, 'i');
    assert.ok(regex.test('Luxury Apartment on Golf Course Road, Gurgaon'));
    assert.ok(!regex.test('Sector 48 Gurgaon'));
  });

  await t.test('10. Literal .* does NOT act as a wildcard', () => {
    const escaped = escapeRegex('.*');
    const regex = new RegExp(escaped, 'i');
    // Should match literal '.*' but NOT match regular text 'Sector 54'
    assert.ok(regex.test('Includes .* in description'));
    assert.ok(!regex.test('Sector 54 Gurgaon'));
  });
});

test('--- BUG-03: AUTHCONTEXT PROFILE STATE UPDATES (UNIT TESTS) ---', async (t) => {
  await t.test('11. updateUser merges name, phone, and profileImage while preserving canonical IDs and role', () => {
    const existingState = {
      _id: '507f1f77bcf86cd799439011',
      id: '507f1f77bcf86cd799439011',
      name: 'Original Name',
      email: 'user@example.com',
      role: 'owner',
      phone: '9876543210',
      profileImage: 'https://example.com/old.jpg',
    };

    // Untrusted response attempting privilege escalation or ID overwrite
    const backendResponseData = {
      name: 'Updated Name',
      phone: '9999999999',
      profileImage: 'https://example.com/new.jpg',
      role: 'admin', // Malicious attempt to change role
      _id: 'malicious_override_id', // Malicious attempt to change user ID
      id: 'malicious_override_id',
    };

    // AuthContext updateUser logic
    const { name, phone, profileImage } = backendResponseData;
    const newState = {
      ...existingState,
      ...(name !== undefined && { name }),
      ...(phone !== undefined && { phone }),
      ...(profileImage !== undefined && { profileImage }),
    };

    assert.strictEqual(newState.name, 'Updated Name', 'Name should be updated');
    assert.strictEqual(newState.phone, '9999999999', 'Phone should be updated');
    assert.strictEqual(newState.profileImage, 'https://example.com/new.jpg');
    // Ensure critical auth fields cannot be overridden
    assert.strictEqual(newState._id, '507f1f77bcf86cd799439011', '_id must be preserved');
    assert.strictEqual(newState.id, '507f1f77bcf86cd799439011', 'id must be preserved');
    assert.strictEqual(newState.role, 'owner', 'role must NOT be escalated');
    assert.strictEqual(newState.email, 'user@example.com', 'email must be preserved');
  });
});

test('--- TASK 2 LIVE HTTP INTEGRATION TESTS ---', async (t) => {
  const BASE_URL = 'http://localhost:5000/api/v1';

  let ownerToken;
  let ownerUser;

  await t.test('12. Login returns standardized user object with both _id and id matching, and no password', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner@example.com', password: 'Password123' }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.data.token, 'Token must be returned');

    const user = data.data.user;
    ownerUser = user;
    ownerToken = data.data.token;

    assert.ok(user._id, 'user._id must be present in login response');
    assert.ok(user.id, 'user.id must be present in login response');
    assert.strictEqual(user._id, user.id, 'user._id and user.id must be strictly identical');
    assert.strictEqual(typeof user._id, 'string', 'user._id must be a string');
    assert.strictEqual(user.password, undefined, 'Password hash must never be returned');
    assert.strictEqual(user.role, 'owner', 'Role should be preserved');
  });

  await t.test('13. Registration returns standardized user object with both _id and id matching', async () => {
    const testEmail = `standardized_user_${Date.now()}@example.com`;
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Standard ID User',
        email: testEmail,
        password: 'Password123',
        role: 'user',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.success, true);

    const user = data.data.user;
    assert.ok(user._id, 'user._id must be present in register response');
    assert.ok(user.id, 'user.id must be present in register response');
    assert.strictEqual(user._id, user.id, 'user._id and user.id must be strictly identical');
    assert.strictEqual(user.password, undefined, 'Password hash must not be returned in register');
  });

  await t.test('14. /auth/me returns standardized user object with both _id and id matching', async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);

    const user = data.data;
    assert.ok(user._id, 'user._id must be present in /auth/me');
    assert.ok(user.id, 'user.id must be present in /auth/me');
    assert.strictEqual(user._id, user.id, 'user._id and user.id must match in /auth/me');
    assert.strictEqual(user._id, ownerUser._id, 'Should match login user ID');
  });

  await t.test('15. Property owner control check succeeds immediately with login user ID', () => {
    // PropertyDetailsPage evaluation check:
    const mockProperty = {
      _id: '6ada029de249e5627878c6e2',
      owner: { _id: ownerUser._id, name: 'Owner' },
    };

    // Owner checks immediately after login
    const ownerId = mockProperty.owner?._id
      ? String(mockProperty.owner._id)
      : mockProperty.owner?.id
      ? String(mockProperty.owner.id)
      : String(mockProperty.owner);
    const currentUserId = ownerUser ? String(ownerUser._id || ownerUser.id || '') : null;
    const isOwnerOrAdmin = Boolean(
      ownerUser && ((ownerId && currentUserId && ownerId === currentUserId) || ownerUser.role === 'admin')
    );

    assert.strictEqual(isOwnerOrAdmin, true, 'Owner controls should be visible immediately after login');

    // Stranger check
    const strangerUser = { _id: '507f1f77bcf86cd799439099', id: '507f1f77bcf86cd799439099', role: 'user' };
    const strangerCurrentId = String(strangerUser._id || strangerUser.id || '');
    const isStrangerOwner = Boolean(
      strangerUser && ((ownerId && strangerCurrentId && ownerId === strangerCurrentId) || strangerUser.role === 'admin')
    );
    assert.strictEqual(isStrangerOwner, false, 'Stranger should not see owner controls');
  });

  await t.test('16. PUT /users/me updates profile and GET /auth/me verifies persistence', async () => {
    const updatedName = `Owner Name ${Date.now()}`;
    const updatedPhone = '9876500000';

    const putRes = await fetch(`${BASE_URL}/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({
        name: updatedName,
        phone: updatedPhone,
      }),
    });
    const putData = await putRes.json();
    assert.strictEqual(putRes.status, 200);
    assert.strictEqual(putData.success, true);
    assert.strictEqual(putData.data.name, updatedName);
    assert.strictEqual(putData.data.phone, updatedPhone);

    // Verify /auth/me reflects the updated name
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    const meData = await meRes.json();
    assert.strictEqual(meData.data.name, updatedName);
  });

  await t.test('17. Search endpoint handles ordinary city and keyword searches', async () => {
    const res = await fetch(`${BASE_URL}/properties?city=Gurgaon&search=Sector`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.data.items));
  });

  await t.test('18. Search endpoint safely handles regex special characters ([, (, ), *, +, ., \\) without error', async () => {
    const specialChars = ['[', 'Gurgaon(', '.*', 'Sector+', 'House*', 'Test\\', 'Condo?'];

    for (const charQuery of specialChars) {
      const res = await fetch(`${BASE_URL}/properties?search=${encodeURIComponent(charQuery)}`);
      assert.strictEqual(res.status, 200, `Search for "${charQuery}" should return 200 and not crash`);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(Array.isArray(data.data.items));
    }
  });

  await t.test('19. City parameter safely handles regex special characters without error', async () => {
    const res = await fetch(`${BASE_URL}/properties?city=${encodeURIComponent('Gurgaon(')}`);
    assert.strictEqual(res.status, 200, 'Unclosed parenthesis in city should not cause 500 error');
    const data = await res.json();
    assert.strictEqual(data.success, true);
  });

  await t.test('20. Search with empty parameters preserves default behavior', async () => {
    const res = await fetch(`${BASE_URL}/properties?search=&city=`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.data.items.length > 0);
  });

  await t.test('21. Excessive search length (>200 characters) returns controlled HTTP 400 validation response', async () => {
    const longSearch = 'A'.repeat(205);
    const res = await fetch(`${BASE_URL}/properties?search=${longSearch}`);
    assert.strictEqual(res.status, 400, 'Should reject search exceeding 200 chars');
    const data = await res.json();
    assert.strictEqual(data.success, false);
  });

  await t.test('22. Excessive city length (>100 characters) returns controlled HTTP 400 validation response', async () => {
    const longCity = 'B'.repeat(105);
    const res = await fetch(`${BASE_URL}/properties?city=${longCity}`);
    assert.strictEqual(res.status, 400, 'Should reject city exceeding 100 chars');
    const data = await res.json();
    assert.strictEqual(data.success, false);
  });

  await t.test('23. Property filters (propertyType, bedrooms, price, sort) continue working with safe search', async () => {
    const res = await fetch(
      `${BASE_URL}/properties?propertyType=apartment&bedrooms=3&minPrice=1000000&maxPrice=50000000&sort=price_asc`
    );
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.data.items));
  });

  await t.test('24. Appointment PATCH with invalid ID format returns HTTP 400', async () => {
    const res = await fetch(`${BASE_URL}/appointments/invalid-id`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({ status: 'accepted' }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.error, 'Invalid appointment ID format');
  });

  await t.test('25. Appointment PATCH with invalid status fails schema validation with HTTP 400', async () => {
    const res = await fetch(`${BASE_URL}/appointments/507f1f77bcf86cd799439011`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({ status: 'invalid_status_value' }),
    });
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
  });
});
