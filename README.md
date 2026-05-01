# RentEase

Find your perfect PG or room, hassle-free.

![Build](https://img.shields.io/badge/build-passing-brightgreen)
![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite-646CFF)
![Backend](https://img.shields.io/badge/backend-Node.js%20%2B%20Express-111827)
![Database](https://img.shields.io/badge/database-MongoDB-10B981)
![Auth](https://img.shields.io/badge/auth-JWT-6366F1)

RentEase is a full-stack rental listing platform for Indian PGs, rooms, studios, flats, and 1BHKs. Tenants can browse, filter, save, and contact landlords. Landlords can create listings, edit their inventory, delete old rooms, and track views from their dashboard.

## Live Demo

Coming soon: `https://rentease.example.com`

## Screenshots

Add screenshots here after deployment:

- `screenshots/home.png`
- `screenshots/browse.png`
- `screenshots/listing-detail.png`
- `screenshots/dashboard.png`

## Features

- Tenant and landlord signup/login with JWT authentication
- Seeded admin login for platform moderation
- Persistent sessions using local storage
- Protected frontend routes and backend role checks
- Landlord listing create, edit, delete, and view-count dashboard
- Tenant saved listings dashboard
- Tenant-landlord messaging with inbox and reply threads
- Admin panel for users, listings, conversations, and platform stats
- Browse grid with city, rent, type, gender, amenity, keyword, and sort filters
- Shareable search URLs powered by query parameters
- Listing detail page with photo carousel, OpenStreetMap embed, gated contact reveal, and bookmark button
- Client-side image capture for up to 5 listing photos
- Seed data with 12 Indian rental listings across Mumbai, Delhi, Bangalore, Hyderabad, Pune, and Lucknow
- Dark navy SaaS interface with glass cards, Syne headings, Inter body text, and responsive layouts

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, Vite, React Router, Framer Motion |
| Styling | Tailwind CSS, custom global CSS |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcryptjs |
| HTTP Client | Axios |
| Maps | OpenStreetMap embed |

## Project Structure

```text
Rentease/
  backend/
    src/
      controllers/
      middleware/
      models/
      routes/
      utils/
      server.js
    seed.js
  frontend/
    src/
      components/
      context/
      hooks/
      pages/
      styles/
      utils/
```

## Setup

### 1. Backend

```powershell
cd backend
npm install
Copy-Item .env.example .env
npm run dev
```

Edit `backend/.env` before starting:

```env
MONGODB_URI=mongodb://localhost:27017/rentease
JWT_SECRET=replace_this_with_a_long_secret
PORT=5000
NODE_ENV=development
```

### 2. Seed Data

```powershell
cd backend
npm run seed
```

Tenant and landlord demo accounts use `password123`.

| Role | Email |
| --- | --- |
| Landlord | `rajesh.kumar@example.com` |
| Landlord | `priya.sharma@example.com` |
| Landlord | `amit.patel@example.com` |
| Landlord | `sneha.desai@example.com` |
| Tenant | `ananya.rao@example.com` |
| Admin | `admin@rentease.com` |

Admin password: `admin123`

### 3. Frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

Backend API: `http://localhost:5000/api`

## API Documentation

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/signup` | Public | Create a tenant or landlord account |
| `POST` | `/api/auth/login` | Public | Login and receive JWT token |
| `GET` | `/api/listings` | Public | List rentals with filters, search, and sorting |
| `POST` | `/api/listings` | Landlord | Create a new rental listing |
| `GET` | `/api/listings/:id` | Public | Get one listing and increment views |
| `PUT` | `/api/listings/:id` | Landlord owner | Update a listing |
| `DELETE` | `/api/listings/:id` | Landlord owner | Delete a listing |
| `POST` | `/api/listings/:id/save` | Logged in | Toggle save/bookmark |
| `GET` | `/api/user/saved` | Logged in | Get current user's saved listings |
| `GET` | `/api/user/listings` | Logged in | Get current landlord's listings |
| `GET` | `/api/messages/conversations` | Tenant/Landlord | Get inbox conversations |
| `POST` | `/api/messages/conversations` | Tenant | Start a listing conversation |
| `GET` | `/api/messages/conversations/:id/messages` | Participant | Get thread messages |
| `POST` | `/api/messages/conversations/:id/messages` | Participant | Send a reply |
| `GET` | `/api/admin/stats` | Admin | Platform totals |
| `GET` | `/api/admin/users` | Admin | Manage users |
| `GET` | `/api/admin/listings` | Admin | Manage listings |
| `GET` | `/api/admin/conversations` | Admin | Review conversation summaries |

### Listing Query Parameters

| Parameter | Example | Notes |
| --- | --- | --- |
| `city` | `Mumbai` | Exact city match |
| `maxRent` | `15000` | Listings at or below rent |
| `type` | `PG` | `PG`, `Flat`, `Studio`, `1BHK` |
| `gender` | `Female` | `Male`, `Female`, `Any` |
| `amenities` | `WiFi&amenities=AC` | Repeat parameter for multiple amenities |
| `search` | `Koramangala` | Searches title, description, city, and locality |
| `sort` | `price-low` | `newest`, `price-low`, `price-high` |

## Scripts

| Location | Command | Purpose |
| --- | --- | --- |
| `backend` | `npm run dev` | Start Express with nodemon |
| `backend` | `npm start` | Start Express |
| `backend` | `npm run seed` | Seed demo users and listings |
| `backend` | `npm run ensure-admin` | Create or reset the default admin account |
| `frontend` | `npm run dev` | Start Vite dev server |
| `frontend` | `npm run build` | Create production build |
| `frontend` | `npm run preview` | Preview production build |

## Notes

- Listing photos are stored as compressed data URLs for a simple local demo. For production, move uploads to object storage such as S3, Cloudinary, or a dedicated media service.
- OpenStreetMap is embedded using approximate city coordinates. Production geocoding should store latitude and longitude on each listing.
