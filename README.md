# VendoShop

Vendor marketplace platform.

## Tech Stack

**Frontend:** React, Vite, Tailwind CSS, Radix UI, React Query  
**Backend:** Node.js, Express, PostgreSQL, Drizzle ORM  
**Auth:** Express Session, Passport.js, bcrypt

## Installation

1. `npm install`
2. Create `.env.local` with `DATABASE_URL` and `SESSION_SECRET`
3. `npm run db:push`
4. `npm run dev`

## API Documentation

**Auth:** `GET /api/auth/vendor`, `GET /api/logout`

**Vendors:** `POST /api/vendors/register`, `POST /api/vendors/login`, `GET /api/vendors`, `GET /api/vendors/:id`, `PATCH /api/vendors/:id` (auth), `GET /api/vendors/:id/products`, `GET /api/vendors/:id/ratings`

**Products:** `POST /api/products` (auth), `PATCH /api/products/:id` (auth), `DELETE /api/products/:id` (auth)

**Ratings:** `POST /api/ratings`

**Request Bodies:**
- Register: `{ vendorName, ownerName, contactNumber, email, password, confirmPassword, businessCategory, city }`
- Login: `{ email, password }`
- Product: `{ vendorId, name, description, price }`
- Rating: `{ vendorId, rating (1-5), comment?, clientName }`
