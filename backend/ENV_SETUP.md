# Environment Variables Setup

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/home-service-booking

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Socket.IO Configuration
SOCKET_IO_PORT=5001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Emergency Booking Lock Timeout (ms)
EMERGENCY_LOCK_TIMEOUT=30000
```

## Description

- **PORT**: Server port (default: 5000)
- **NODE_ENV**: Environment mode (development/production)
- **MONGODB_URI**: MongoDB connection string
- **JWT_SECRET**: Secret key for JWT token signing (change in production!)
- **JWT_EXPIRE**: JWT token expiration time (e.g., 7d, 24h)
- **SOCKET_IO_PORT**: Socket.IO port (default: 5001)
- **RATE_LIMIT_WINDOW_MS**: Rate limit window in milliseconds (15 minutes default)
- **RATE_LIMIT_MAX_REQUESTS**: Maximum requests per window
- **EMERGENCY_LOCK_TIMEOUT**: Lock timeout for emergency bookings in milliseconds (30 seconds default)

## Production Notes

- Always use a strong, random JWT_SECRET in production
- Use environment-specific MongoDB URIs
- Adjust rate limits based on your traffic
- Set NODE_ENV=production for production deployments

