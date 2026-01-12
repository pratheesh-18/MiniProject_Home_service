import { Booking, IBooking } from '../models/Booking';
import { Provider } from '../models/Provider';
import { User } from '../models/User';
import { NotFoundError, ValidationError, ConflictError, ForbiddenError } from '../utils/errors';
import { calculateDistance } from '../utils/haversine';
import { config } from '../config/env';
import { emitBookingStatusChange, emitProviderAssigned } from '../config/socket';

export const createBooking = async (
  customerId: string,
  providerId: string,
  service: string,
  location: { coordinates: [number, number]; address: string },
  estimatedDuration: number,
  scheduledAt?: Date,
  notes?: string,
  emergency: boolean = false
): Promise<IBooking> => {
  // Verify customer exists
  const customer = await User.findById(customerId);
  if (!customer || customer.role !== 'customer') {
    throw new NotFoundError('Customer not found');
  }

  // Verify provider exists and is available
  const provider = await Provider.findById(providerId).populate('user');
  if (!provider) {
    throw new NotFoundError('Provider not found');
  }

  if (!provider.isAvailable && !emergency) {
    throw new ValidationError('Provider is not available');
  }

  if (!provider.isVerified && !emergency) {
    throw new ValidationError('Provider is not verified');
  }

  // Calculate total amount
  const hourlyRate = provider.hourlyRate;
  const totalAmount = (hourlyRate * estimatedDuration) / 60;

  // Create booking
  const booking = await Booking.create({
    customer: customerId,
    provider: providerId,
    service,
    location: {
      type: 'Point',
      coordinates: location.coordinates,
      address: location.address,
    },
    estimatedDuration,
    scheduledAt: scheduledAt || new Date(),
    totalAmount,
    notes,
    emergency,
    status: 'pending',
  });

  // Emit socket event
  emitBookingStatusChange(booking._id.toString(), 'pending', { booking });
  emitProviderAssigned(booking._id.toString(), providerId);

  return booking;
};

export const acceptBooking = async (
  bookingId: string,
  providerId: string
): Promise<IBooking> => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new NotFoundError('Booking not found');
  }

  if (booking.provider.toString() !== providerId) {
    throw new ForbiddenError('You are not authorized to accept this booking');
  }

  if (booking.status !== 'pending') {
    throw new ValidationError(`Cannot accept booking with status: ${booking.status}`);
  }

  booking.status = 'accepted';
  booking.isLocked = false;
  booking.lockedUntil = undefined;
  await booking.save();

  // Emit socket event
  emitBookingStatusChange(booking._id.toString(), 'accepted', { booking });

  return booking;
};

export const startBooking = async (
  bookingId: string,
  providerId: string
): Promise<IBooking> => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new NotFoundError('Booking not found');
  }

  if (booking.provider.toString() !== providerId) {
    throw new ForbiddenError('You are not authorized to start this booking');
  }

  if (booking.status !== 'accepted') {
    throw new ValidationError(`Cannot start booking with status: ${booking.status}`);
  }

  booking.status = 'started';
  booking.startedAt = new Date();
  await booking.save();

  // Emit socket event
  emitBookingStatusChange(booking._id.toString(), 'started', { booking });

  return booking;
};

export const completeBooking = async (
  bookingId: string,
  providerId: string,
  actualDuration?: number
): Promise<IBooking> => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new NotFoundError('Booking not found');
  }

  if (booking.provider.toString() !== providerId) {
    throw new ForbiddenError('You are not authorized to complete this booking');
  }

  if (booking.status !== 'started') {
    throw new ValidationError(`Cannot complete booking with status: ${booking.status}`);
  }

  booking.status = 'completed';
  booking.completedAt = new Date();
  
  if (actualDuration) {
    booking.actualDuration = actualDuration;
    // Recalculate amount if duration changed
    const provider = await Provider.findById(providerId);
    if (provider) {
      booking.totalAmount = (provider.hourlyRate * actualDuration) / 60;
    }
  }

  await booking.save();

  // Emit socket event
  emitBookingStatusChange(booking._id.toString(), 'completed', { booking });

  return booking;
};

export const cancelBooking = async (
  bookingId: string,
  userId: string,
  userRole: string
): Promise<IBooking> => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new NotFoundError('Booking not found');
  }

  const isCustomer = booking.customer.toString() === userId;
  const isProvider = booking.provider.toString() === userId;
  const isAdmin = userRole === 'admin';

  if (!isCustomer && !isProvider && !isAdmin) {
    throw new ForbiddenError('You are not authorized to cancel this booking');
  }

  if (['completed', 'cancelled'].includes(booking.status)) {
    throw new ValidationError(`Cannot cancel booking with status: ${booking.status}`);
  }

  booking.status = 'cancelled';
  booking.isLocked = false;
  booking.lockedUntil = undefined;
  await booking.save();

  return booking;
};

// Emergency booking with locking mechanism
export const createEmergencyBooking = async (
  customerId: string,
  service: string,
  location: { coordinates: [number, number]; address: string },
  estimatedDuration: number,
  notes?: string
): Promise<IBooking> => {
  const [longitude, latitude] = location.coordinates;

  // Find nearest available provider
  const providers = await Provider.find({
    isVerified: true,
    isAvailable: true,
    services: { $in: [service] },
    currentLocation: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        $maxDistance: 50 * 1000, // 50km max
      },
    },
  })
    .limit(1)
    .lean();

  if (providers.length === 0) {
    throw new NotFoundError('No available providers found nearby');
  }

  const provider = providers[0];

  // Lock mechanism: Try to create booking with lock
  const lockTimeout = new Date(Date.now() + config.emergency.lockTimeout);
  
  try {
    // Check if provider is already locked
    const existingLock = await Booking.findOne({
      provider: provider._id,
      isLocked: true,
      lockedUntil: { $gt: new Date() },
      status: { $in: ['pending', 'accepted'] },
    });

    if (existingLock) {
      throw new ConflictError('Provider is currently locked by another booking');
    }

    // Create booking with lock
    const booking = await Booking.create({
      customer: customerId,
      provider: provider._id,
      service,
      location: {
        type: 'Point',
        coordinates: location.coordinates,
        address: location.address,
      },
      estimatedDuration,
      scheduledAt: new Date(),
      totalAmount: (provider.hourlyRate * estimatedDuration) / 60,
      notes,
      emergency: true,
      status: 'pending',
      isLocked: true,
      lockedUntil: lockTimeout,
    });

    // Mark provider as unavailable temporarily
    await Provider.findByIdAndUpdate(provider._id, { isAvailable: false });

    // Emit socket events
    emitBookingStatusChange(booking._id.toString(), 'pending', { booking, emergency: true });
    emitProviderAssigned(booking._id.toString(), provider._id.toString());

    return booking;
  } catch (error) {
    if (error instanceof ConflictError) {
      throw error;
    }
    // Retry with next provider if available
    throw new ConflictError('Failed to create emergency booking. Please try again.');
  }
};

export const releaseBookingLock = async (bookingId: string): Promise<void> => {
  const booking = await Booking.findById(bookingId);
  
  if (booking && booking.isLocked) {
    booking.isLocked = false;
    booking.lockedUntil = undefined;
    await booking.save();

    // Re-enable provider availability
    await Provider.findByIdAndUpdate(booking.provider, { isAvailable: true });
  }
};

// Auto-release locks that have expired
export const cleanupExpiredLocks = async (): Promise<void> => {
  const expiredLocks = await Booking.updateMany(
    {
      isLocked: true,
      lockedUntil: { $lt: new Date() },
    },
    {
      $set: {
        isLocked: false,
        lockedUntil: undefined,
      },
    }
  );

  // Re-enable providers for expired locks
  const expiredBookings = await Booking.find({
    isLocked: false,
    lockedUntil: { $exists: true },
    status: 'pending',
  }).select('provider');

  const providerIds = [...new Set(expiredBookings.map((b) => b.provider.toString()))];
  await Provider.updateMany(
    { _id: { $in: providerIds } },
    { isAvailable: true }
  );
};

