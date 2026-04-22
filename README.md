# Simba Backend

Production-ready Node.js + Express + PostgreSQL backend for the Simba grocery delivery app.

## Stack

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- JWT authentication

## Features

- User registration and login
- JWT-protected cart and orders
- Product catalog with pagination, filtering, and search
- Categories and subcategories
- Persistent cart storage in PostgreSQL
- Order creation with immutable product snapshots
- Validation, centralized error handling, CORS, and security middleware

## Project Structure

```text
src/
  config/
  controllers/
  middleware/
  models/
  routes/
  services/
  utils/
prisma/
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env file:

```bash
cp .env.example .env
```

3. Update `.env` with your PostgreSQL connection and JWT secret.

4. Generate Prisma client:

```bash
npm run prisma:generate
```

5. Run migrations:

```bash
npm run prisma:migrate
```

6. Start development server:

```bash
npm run dev
```

## Production Start

```bash
npm run prisma:deploy
npm start
```

## API Overview

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Categories

- `GET /api/categories`
- `GET /api/categories/:id`
- `POST /api/categories`
- `POST /api/categories/:categoryId/subcategories`

### Products

- `GET /api/products?page=1&limit=10&categoryId=&subcategoryId=&search=`
- `GET /api/products/:id`
- `POST /api/products`
- `PATCH /api/products/:id`
- `DELETE /api/products/:id`

### Cart

- `GET /api/cart`
- `POST /api/cart/items`
- `PATCH /api/cart/items/:id`
- `DELETE /api/cart/items/:id`
- `DELETE /api/cart`

### Orders

- `POST /api/orders`
- `GET /api/orders`
- `GET /api/orders/:id`

## Render Deployment

1. Create a PostgreSQL database in Render.
2. Create a new Web Service connected to this repository.
3. Set environment variables in Render:
   - `NODE_ENV=production`
   - `PORT=10000`
   - `DATABASE_URL=...`
   - `JWT_SECRET=...`
   - `JWT_EXPIRES_IN=7d`
   - `CORS_ORIGIN=https://your-frontend-domain.com`
4. Set Build Command:

```bash
npm install && npm run prisma:generate && npm run prisma:deploy
```

5. Set Start Command:

```bash
npm start
```

## Notes

- Product and category write endpoints are protected and require an admin user.
- Order totals are calculated server-side.
- Orders persist product name and price snapshots at checkout time.
