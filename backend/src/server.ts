import app from './app';
import { connectDB } from './config/database';
import { config } from './config/env';
import { cleanupExpiredLocks } from './services/bookingService';

const PORT = config.port;

// Connect to database
connectDB()
  .then(() => {
    // Start server
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${config.nodeEnv} mode`);
    });

    // Setup Socket.IO
    const { setupSocketIO } = require('./config/socket');
    setupSocketIO(server);

    // Cleanup expired locks every 5 minutes
    setInterval(async () => {
      try {
        await cleanupExpiredLocks();
      } catch (error) {
        console.error('Error cleaning up expired locks:', error);
      }
    }, 5 * 60 * 1000);

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('Process terminated');
        process.exit(0);
      });
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });

