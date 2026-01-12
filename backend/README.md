# Home Service Booking System - Backend

Production-ready backend for a Home Service Booking System with Geolocation features.

## Features

- ✅ Role-based authentication (Customer, Provider, Admin)
- ✅ Geolocation-based provider search using Haversine distance
- ✅ Complete booking lifecycle (create, accept, start, complete, cancel)
- ✅ Emergency booking with locking mechanism to prevent double assignment
- ✅ Real-time updates with Socket.IO
- ✅ Ratings, reviews, and provider badges
- ✅ Admin APIs for verification, statistics, and dispute handling
- ✅ Security features (JWT, rate limiting, validation, error handling)
- ✅ Swagger/OpenAPI documentation
- ✅ Comprehensive test suite

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT
- **Real-time**: Socket.IO
- **Validation**: express-validator
- **Documentation**: Swagger/OpenAPI

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.ts
│   │   ├── env.ts
│   │   └── socket.ts
│   ├── controllers/     # Request handlers
│   │   ├── authController.ts
│   │   ├── providerController.ts
│   │   ├── bookingController.ts
│   │   ├── ratingController.ts
│   │   └── adminController.ts
│   ├── middlewares/     # Express middlewares
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   ├── rateLimiter.ts
│   │   └── validator.ts
│   ├── models/          # MongoDB models
│   │   ├── User.ts
│   │   ├── Provider.ts
│   │   ├── Booking.ts
│   │   ├── GroupBooking.ts
│   │   └── Rating.ts
│   ├── routes/          # API routes
│   │   ├── authRoutes.ts
│   │   ├── providerRoutes.ts
│   │   ├── bookingRoutes.ts
│   │   ├── ratingRoutes.ts
│   │   └── adminRoutes.ts
│   ├── services/        # Business logic
│   │   ├── authService.ts
│   │   ├── providerService.ts
│   │   ├── bookingService.ts
│   │   ├── ratingService.ts
│   │   └── adminService.ts
│   ├── utils/           # Utility functions
│   │   ├── haversine.ts
│   │   ├── errors.ts
│   │   └── seed.ts
│   ├── __tests__/       # Unit tests
│   ├── app.ts           # Express app configuration
│   └── server.ts        # Server entry point
├── .env.example
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Installation

1. **Clone the repository and navigate to backend directory**

```bash
cd backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the backend directory:

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

4. **Start MongoDB**

Make sure MongoDB is running on your system.

5. **Seed the database (optional)**

```bash
npm run seed
```

This will create:
- 50 providers with clustered locations
- 1 admin user (admin@example.com / admin123)
- 1 test customer (customer@example.com / password123)

6. **Run the development server**

```bash
npm run dev
```

The server will start on `http://localhost:5000`

## API Documentation

### Swagger UI

Once the server is running, visit:
```
http://localhost:5000/api-docs
```

### Postman Collection

Import the `postman_collection.json` file into Postman for a complete API collection.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Providers
- `GET /api/providers/search` - Search providers by location
- `GET /api/providers/:id` - Get provider by ID
- `PATCH /api/providers/:id/location` - Update provider location (protected)
- `PATCH /api/providers/:id/availability` - Update provider availability (protected)

### Bookings
- `POST /api/bookings` - Create a new booking (protected)
- `POST /api/bookings/emergency` - Create emergency booking (protected)
- `GET /api/bookings` - Get user's bookings (protected)
- `GET /api/bookings/:id` - Get booking by ID (protected)
- `PATCH /api/bookings/:id/accept` - Accept booking (provider, protected)
- `PATCH /api/bookings/:id/start` - Start booking (provider, protected)
- `PATCH /api/bookings/:id/complete` - Complete booking (provider, protected)
- `PATCH /api/bookings/:id/cancel` - Cancel booking (protected)

### Ratings
- `POST /api/ratings` - Create a rating (protected)
- `GET /api/ratings/provider/:providerId` - Get provider ratings

### Admin
- `PATCH /api/admin/providers/:providerId/verify` - Verify provider (admin)
- `GET /api/admin/statistics/bookings` - Get booking statistics (admin)
- `GET /api/admin/statistics/providers` - Get provider statistics (admin)
- `PATCH /api/admin/disputes/:bookingId/resolve` - Resolve dispute (admin)
- `GET /api/admin/users` - Get all users (admin)

## Socket.IO Events

### Client Events
- `provider:join` - Join provider room
- `booking:join` - Join booking room
- `provider:location` - Update provider location

### Server Events
- `provider:location:updated` - Provider location updated
- `booking:status:changed` - Booking status changed
- `booking:assigned` - Booking assigned to provider

## Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm test -- --coverage
```

## Production Build

Build the project:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## Key Features Explained

### Geolocation Search
Providers are searched using MongoDB's geospatial queries with Haversine distance calculation. Results can be filtered by:
- Service type
- Minimum rating
- Maximum hourly rate
- Verification status
- Availability
- Maximum distance

Results can be sorted by distance, rating, or hourly rate.

### Emergency Booking
Emergency bookings automatically assign the nearest available provider using a locking mechanism:
- Provider is locked for 30 seconds (configurable)
- Prevents double assignment
- Automatically releases lock if booking is not accepted
- Admin is notified of emergency bookings

### Real-time Updates
Socket.IO is used for:
- Provider location tracking
- Booking status updates
- Real-time notifications

### Provider Badges
Badges are automatically assigned based on:
- `verified` - Admin verified
- `top-rated` - Rating >= 4.5
- `popular` - 50+ ratings
- `expert` - Rating >= 4.0 and 20+ ratings
- `fast-response` - Can be added manually

## Security Features

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- Input validation
- Centralized error handling
- Helmet for security headers
- CORS configuration

## License

ISC

