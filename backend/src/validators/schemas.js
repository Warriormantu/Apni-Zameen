import { z } from 'zod';

export const authRegisterSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    phone: z.string().optional(),
    role: z.enum(['user', 'owner', 'agent']).optional(),
  }),
});

export const authLoginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
  }),
});

const emptyToUndefined = (schema) =>
  z.preprocess((val) => (val === '' || val === null || val === undefined ? undefined : val), schema);

export const propertyQuerySchema = z.object({
  query: z.object({
    city: emptyToUndefined(z.string().max(100).optional()),
    propertyType: emptyToUndefined(z.enum(['apartment', 'villa', 'house', 'commercial', 'land', 'pg', 'coliving']).optional()),
    listingType: emptyToUndefined(z.enum(['sale', 'rent']).optional()),
    minPrice: emptyToUndefined(z.coerce.number().nonnegative().optional()),
    maxPrice: emptyToUndefined(z.coerce.number().nonnegative().optional()),
    bedrooms: emptyToUndefined(z.union([z.coerce.number().int().nonnegative(), z.string()]).optional()),
    bathrooms: emptyToUndefined(z.coerce.number().int().nonnegative().optional()),
    search: emptyToUndefined(z.string().max(200).optional()),
    sort: emptyToUndefined(z.string().max(50).optional()),
    page: emptyToUndefined(z.coerce.number().int().positive().optional()),
    limit: emptyToUndefined(z.coerce.number().int().positive().optional()),
  }),
});

export const propertyCreateSchema = z.object({
  body: z.object({
    title: z.string().min(3),
    description: z.string().min(5),
    propertyType: z.enum(['apartment', 'villa', 'house', 'commercial', 'land', 'pg', 'coliving']),
    listingType: z.enum(['sale', 'rent']),
    price: z.number().positive(),
    location: z
      .object({
        lat: z.number().optional().default(0),
        lng: z.number().optional().default(0),
        address: z.string().optional().default(''),
      })
      .optional()
      .default({ lat: 0, lng: 0, address: '' }),
    city: z.string().min(1),
    state: z.string().optional().default('Haryana'),
    pincode: z.string().optional().default('122001'),
    bedrooms: z.number().int().nonnegative().optional().default(1),
    bathrooms: z.number().int().nonnegative().optional().default(1),
    area: z.number().positive().optional().default(1000),
    amenities: z.array(z.string()).optional().default([]),
    images: z.array(z.union([z.string(), z.object({ url: z.string(), public_id: z.string().optional() })])).optional().default([]),
    videos: z.array(z.string()).optional().default([]),
    status: z.enum(['active', 'pending', 'sold', 'rented', 'inactive']).optional().default('active'),
  }),
});

export const propertyIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid property ID format'),
  }),
});

export const propertyUpdateSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid property ID format'),
  }).optional(),
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().min(5).optional(),
    propertyType: z.enum(['apartment', 'villa', 'house', 'commercial', 'land', 'pg', 'coliving']).optional(),
    listingType: z.enum(['sale', 'rent']).optional(),
    price: z.number().positive().optional(),
    location: z
      .object({
        lat: z.number().optional(),
        lng: z.number().optional(),
        address: z.string().optional(),
      })
      .optional(),
    city: z.string().min(1).optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
    bedrooms: z.number().int().nonnegative().optional(),
    bathrooms: z.number().int().nonnegative().optional(),
    area: z.number().positive().optional(),
    amenities: z.array(z.string()).optional(),
    images: z.array(z.union([z.string(), z.object({ url: z.string(), public_id: z.string().optional() })])).optional(),
    videos: z.array(z.string()).optional(),
    status: z.enum(['active', 'pending', 'sold', 'rented', 'inactive']).optional(),
  }).strict('Unauthorized fields present in property update request'),
});

export const appointmentSchema = z.object({
  body: z.object({
    property: z.string().length(24),
    date: z.string().min(1),
    time: z.string().min(1),
    notes: z.string().optional(),
  }),
});

export const appointmentUpdateSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'accepted', 'rejected', 'rescheduled', 'cancelled']),
  }),
});

export const messageSchema = z.object({
  body: z.object({
    property: z.string().length(24),
    receiver: z.string().length(24),
    message: z.string().min(1),
  }),
});

export const profileUpdateSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    phone: z.string().optional(),
    profileImage: z.string().url().optional(),
  }),
});
