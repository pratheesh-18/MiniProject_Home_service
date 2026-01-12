import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { Booking } from '../models/Booking';
import { Provider } from '../models/Provider';

let io: Server;

export const setupSocketIO = (httpServer: HttpServer): void => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join provider room for location updates
    socket.on('provider:join', (providerId: string) => {
      socket.join(`provider:${providerId}`);
      console.log(`Provider ${providerId} joined room`);
    });

    // Join booking room for status updates
    socket.on('booking:join', (bookingId: string) => {
      socket.join(`booking:${bookingId}`);
      console.log(`Client joined booking room: ${bookingId}`);
    });

    // Handle provider location updates
    socket.on('provider:location', async (data: { providerId: string; longitude: number; latitude: number }) => {
      try {
        const { providerId, longitude, latitude } = data;
        
        await Provider.findByIdAndUpdate(providerId, {
          currentLocation: {
            type: 'Point',
            coordinates: [longitude, latitude],
            updatedAt: new Date(),
          },
        });

        // Broadcast to admin and relevant customers
        io.emit('provider:location:updated', {
          providerId,
          location: { longitude, latitude },
        });
      } catch (error) {
        console.error('Error updating provider location:', error);
        socket.emit('error', { message: 'Failed to update location' });
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

export const emitBookingStatusChange = (bookingId: string, status: string, data?: any): void => {
  if (io) {
    io.to(`booking:${bookingId}`).emit('booking:status:changed', {
      bookingId,
      status,
      ...data,
    });
  }
};

export const emitProviderAssigned = (bookingId: string, providerId: string): void => {
  if (io) {
    io.to(`provider:${providerId}`).emit('booking:assigned', {
      bookingId,
      providerId,
    });
  }
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

