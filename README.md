# ApniZameen

A MERN-based real estate marketplace platform for buying, renting, and listing properties in India.

## Project Structure

- `backend/` — Express API, MongoDB models, auth, property routes, RBAC, validation
- `frontend/` — Vite + React app with Tailwind, React Router, React Query, authentication UI

## Getting Started

1. Copy environment files:
   - `backend/.env.example` -> `backend/.env`
   - `frontend/.env.example` -> `frontend/.env`
2. Set `backend/.env` values:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN`
   - `PORT`
   - `CLIENT_URL`
   - Cloudinary and email config if you use uploads and notifications
3. Set `frontend/.env` values:
   - `VITE_API_BASE_URL=http://localhost:5000/api/v1`

## Install Dependencies

From the project root:

```bash
npm install
```

## Run Locally

Backend:

```bash
npm run --workspace backend dev
```

Frontend:

```bash
npm run --workspace frontend dev
```

## Seed Demo Data

```bash
npm run --workspace backend seed
```

## What’s Included

- JWT authentication with roles: `user`, `owner`, `agent`, `admin`
- Property listing and search endpoints
- Property create page and protected route
- Request validation with Zod
- Seed script with demo users and properties

## Next Steps

- Add Cloudinary upload support
- Build appointment, review, message, and favorite systems
- Add admin/agent dashboards
- Add SEO and accessibility improvements
