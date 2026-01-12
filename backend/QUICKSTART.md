# Quick Start Guide

## Prerequisites

- Node.js v16+ installed
- MongoDB running locally or accessible remotely

## Setup Steps

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   Copy the environment variables from `ENV_SETUP.md` or create `.env` with:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/home-service-booking
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   SOCKET_IO_PORT=5001
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   EMERGENCY_LOCK_TIMEOUT=30000
   ```

4. **Seed the database (optional but recommended)**
   ```bash
   npm run seed
   ```
   This creates:
   - 50 providers with clustered locations in Bangalore
   - Admin user: `admin@example.com` / `admin123`
   - Test customer: `customer@example.com` / `password123`

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Verify server is running**
   - Server: http://localhost:5000
   - Health check: http://localhost:5000/health
   - API Docs: http://localhost:5000/api-docs

## Test the API

### 1. Register a new user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phone": "+919999999999",
    "role": "customer"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "password123"
  }'
```

### 3. Search providers (no auth required)
```bash
curl "http://localhost:5000/api/providers/search?latitude=12.9716&longitude=77.5946&maxDistance=10&service=Plumbing"
```

### 4. Create a booking (requires auth token)
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "providerId": "PROVIDER_ID_HERE",
    "service": "Plumbing",
    "location": {
      "coordinates": [77.5946, 12.9716],
      "address": "123 Main Street, Bangalore"
    },
    "estimatedDuration": 60,
    "notes": "Fix leaking pipe"
  }'
```

## Postman Collection

Import `postman_collection.json` into Postman for a complete API collection with all endpoints pre-configured.

## Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Watch mode
npm run test:watch
```

## Production Build

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod` or check your MongoDB service
- Verify `MONGODB_URI` in `.env` is correct

### Port Already in Use
- Change `PORT` in `.env` to a different port
- Or stop the process using port 5000

### Module Not Found Errors
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then `npm install`

### TypeScript Errors
- Run `npm run build` to check for compilation errors
- Ensure all dependencies are installed

