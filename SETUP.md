# RentEase Quick Start

## MongoDB Atlas

Create a free MongoDB Atlas cluster and use its connection string in `backend/.env`.

```env
MONGODB_URI=mongodb+srv://user:password@cluster0.example.mongodb.net/rentease?retryWrites=true&w=majority
JWT_SECRET=replace_this_with_a_long_secret
PORT=5000
NODE_ENV=production
```

1. Create a free cluster at `https://www.mongodb.com/cloud/atlas`.
2. Create a database user.
3. Allow your current IP address in Network Access. For deployment, also allow your host provider IP, or use `0.0.0.0/0` for a demo.
4. Copy the driver connection string.
5. Put it in `backend/.env` or your backend host environment variables.

## Cloudinary

```env
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_FOLDER=rentease/listings
```

Create a free Cloudinary account, open Dashboard, and copy Cloud Name, API Key, and API Secret. Listing images uploaded by landlords are stored in Cloudinary, and MongoDB stores the returned image URLs.

## Run Backend

```powershell
cd backend
npm install
npm run dev
```

Expected output:

```text
Server running on port 5000
MongoDB connected
```

## Seed Demo Data

```powershell
cd backend
npm run seed
```

Tenant and landlord seeded users use this password:

```text
password123
```

Useful demo accounts:

```text
Landlord: rajesh.kumar@example.com
Landlord: priya.sharma@example.com
Tenant: ananya.rao@example.com
Admin: admin@rentease.com
```

Admin password:

```text
admin123
```

To create or reset only the admin account without reseeding all data:

```powershell
cd backend
npm run ensure-admin
```

## Run Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

## Quick Test Path

1. Seed the database.
2. Log in as `ananya.rao@example.com` with `password123`.
3. Browse listings, change filters, save a listing, and open the tenant dashboard.
4. Log out.
5. Log in as `rajesh.kumar@example.com` with `password123`.
6. Create a listing, edit it from the dashboard, and delete it.
7. Log in as `admin@rentease.com` with `admin123`.
8. Open `/admin` to review users, listings, conversations, and platform stats.
