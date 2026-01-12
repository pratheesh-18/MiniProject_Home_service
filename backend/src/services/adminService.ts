import { Provider } from '../models/Provider';
import { Booking } from '../models/Booking';
import { User } from '../models/User';
import { Rating } from '../models/Rating';
import { NotFoundError } from '../utils/errors';

export const verifyProvider = async (
  providerId: string,
  verified: boolean
): Promise<void> => {
  const provider = await Provider.findById(providerId);

  if (!provider) {
    throw new NotFoundError('Provider not found');
  }

  provider.isVerified = verified;
  
  if (verified && !provider.badges.includes('verified')) {
    provider.badges.push('verified');
  } else if (!verified) {
    provider.badges = provider.badges.filter((b) => b !== 'verified');
  }

  await provider.save();

  // Also update user verification status
  await User.findByIdAndUpdate(provider.user, { isVerified: verified });
};

export const getBookingStatistics = async (
  startDate?: Date,
  endDate?: Date
) => {
  const query: any = {};

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = startDate;
    if (endDate) query.createdAt.$lte = endDate;
  }

  const totalBookings = await Booking.countDocuments(query);
  const completedBookings = await Booking.countDocuments({
    ...query,
    status: 'completed',
  });
  const pendingBookings = await Booking.countDocuments({
    ...query,
    status: 'pending',
  });
  const cancelledBookings = await Booking.countDocuments({
    ...query,
    status: 'cancelled',
  });
  const emergencyBookings = await Booking.countDocuments({
    ...query,
    emergency: true,
  });

  const totalRevenue = await Booking.aggregate([
    { $match: { ...query, status: 'completed', paymentStatus: 'paid' } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } },
  ]);

  const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

  return {
    totalBookings,
    completedBookings,
    pendingBookings,
    cancelledBookings,
    emergencyBookings,
    revenue: parseFloat(revenue.toFixed(2)),
    completionRate: totalBookings > 0 
      ? parseFloat(((completedBookings / totalBookings) * 100).toFixed(2))
      : 0,
  };
};

export const getProviderStatistics = async () => {
  const totalProviders = await Provider.countDocuments();
  const verifiedProviders = await Provider.countDocuments({ isVerified: true });
  const availableProviders = await Provider.countDocuments({ isAvailable: true });

  const topRatedProviders = await Provider.find()
    .sort({ rating: -1 })
    .limit(10)
    .populate('user', 'name email')
    .select('rating totalRatings services hourlyRate');

  return {
    totalProviders,
    verifiedProviders,
    availableProviders,
    topRatedProviders,
  };
};

export const handleDispute = async (
  bookingId: string,
  resolution: string,
  refundAmount?: number
): Promise<void> => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new NotFoundError('Booking not found');
  }

  booking.status = 'disputed';
  booking.notes = `${booking.notes || ''}\n\nDispute Resolution: ${resolution}`;

  if (refundAmount) {
    booking.paymentStatus = 'refunded';
    booking.totalAmount = booking.totalAmount - refundAmount;
  }

  await booking.save();
};

export const getAllUsers = async (role?: string, limit: number = 50, skip: number = 0) => {
  const query: any = {};
  if (role) {
    query.role = role;
  }

  const users = await User.find(query)
    .select('-password')
    .limit(limit)
    .skip(skip)
    .sort({ createdAt: -1 });

  return users;
};

