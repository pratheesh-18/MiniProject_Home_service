import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/home-service-booking',
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    expire: process.env.JWT_EXPIRE || '7d',
  },
  socketIo: {
    port: parseInt(process.env.SOCKET_IO_PORT || '5001', 10),
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  emergency: {
    lockTimeout: parseInt(process.env.EMERGENCY_LOCK_TIMEOUT || '30000', 10),
  },
};

