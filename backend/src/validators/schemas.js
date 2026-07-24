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

export const propertyQuerySchema = z.object({
  query: z.object({
    city: z.string().max(100).optional(),
    propertyType: z.enum(['apartment', 'villa', 'house', 'commercial', 'land', 'pg', 'coliving']).optional(),
    listingType: z.enum(['sale', 'rent']).optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    bedrooms: z.coerce.number().int().nonnegative().optional(),
    bathrooms: z.coerce.number().int().nonnegative().optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().optional(),
  }),
});

export const propertyCreateSchema = z.object({
  body: z.object({
    title: z.string().min(5),
    description: z.string().min(20),
    propertyType: z.enum(['apartment', 'villa', 'house', 'commercial', 'land', 'pg', 'coliving']),
    listingType: z.enum(['sale', 'rent']),
    price: z.number().positive(),
    location: z.object({
      lat: z.number(),
      lng: z.number(),
      address: z.string().min(5),
    }),
    city: z.string().min(2),
    state: z.string().min(2),
    pincode: z.string().min(4),
    bedrooms: z.number().int().nonnegative(),
    bathrooms: z.number().int().nonnegative(),
    area: z.number().positive(),
    amenities: z.array(z.string()).optional(),
    images: z.array(z.string().url()).optional(),
    videos: z.array(z.string().url()).optional(),
    status: z.enum(['active', 'pending', 'sold', 'rented', 'inactive']).optional(),
  }),
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
