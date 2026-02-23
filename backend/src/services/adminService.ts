import { Provider } from '../models/Provider';
import { Booking } from '../models/Booking';
import { User } from '../models/User';
import { NotFoundError } from '../utils/errors';
import bcrypt from 'bcryptjs';

// ── Provider verification ───────────────────────────────────────────────────

export const verifyProvider = async (
  providerId: string,
  verified: boolean
): Promise<void> => {
  const provider = await Provider.findById(providerId);
  if (!provider) throw new NotFoundError('Provider not found');

  provider.isVerified = verified;
  if (verified && !provider.badges.includes('verified')) {
    provider.badges.push('verified');
  } else if (!verified) {
    provider.badges = provider.badges.filter((b) => b !== 'verified');
  }
  await provider.save();
  await User.findByIdAndUpdate(provider.user, { isVerified: verified });
};

// ── Booking statistics ───────────────────────────────────────────────────────

export const getBookingStatistics = async (startDate?: Date, endDate?: Date) => {
  const query: any = {};
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = startDate;
    if (endDate) query.createdAt.$lte = endDate;
  }

  const [totalBookings, completedBookings, pendingBookings, cancelledBookings, emergencyBookings] = await Promise.all([
    Booking.countDocuments(query),
    Booking.countDocuments({ ...query, status: 'completed' }),
    Booking.countDocuments({ ...query, status: 'pending' }),
    Booking.countDocuments({ ...query, status: 'cancelled' }),
    Booking.countDocuments({ ...query, emergency: true }),
  ]);

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

// ── Provider statistics ──────────────────────────────────────────────────────

export const getProviderStatistics = async () => {
  const [totalProviders, verifiedProviders, availableProviders, topRatedProviders] = await Promise.all([
    Provider.countDocuments(),
    Provider.countDocuments({ isVerified: true }),
    Provider.countDocuments({ isAvailable: true }),
    Provider.find()
      .sort({ rating: -1 })
      .limit(10)
      .populate('user', 'name email profilePicture')
      .select('rating totalRatings services hourlyRate isVerified isAvailable'),
  ]);

  return { totalProviders, verifiedProviders, availableProviders, topRatedProviders };
};

// ── Dispute resolution ───────────────────────────────────────────────────────

export const handleDispute = async (
  bookingId: string,
  resolution: string,
  refundAmount?: number
): Promise<void> => {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new NotFoundError('Booking not found');

  booking.status = 'disputed';
  booking.notes = `${booking.notes || ''}\n\nDispute Resolution: ${resolution}`;
  if (refundAmount) {
    booking.paymentStatus = 'refunded';
    booking.totalAmount = booking.totalAmount - refundAmount;
  }
  await booking.save();
};

// ── Users CRUD ───────────────────────────────────────────────────────────────

export const getAllUsers = async (role?: string, limit: number = 200, skip: number = 0) => {
  const query: any = {};
  if (role) query.role = role;
  return User.find(query).select('-password').limit(limit).skip(skip).sort({ createdAt: -1 });
};

export const getUserById = async (userId: string) => {
  const user = await User.findById(userId).select('-password');
  if (!user) throw new NotFoundError('User not found');
  return user;
};

export const createUser = async (data: {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: 'customer' | 'provider' | 'admin';
}) => {
  const exists = await User.findOne({ email: data.email });
  if (exists) throw new Error('Email already in use');
  const hashedPassword = await bcrypt.hash(data.password, 12);
  const user = await User.create({ ...data, password: hashedPassword });
  const { password: _pw, ...rest } = user.toObject();
  return rest;
};

export const updateUser = async (
  userId: string,
  updates: { name?: string; email?: string; phone?: string; role?: string }
) => {
  const user = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true }).select('-password');
  if (!user) throw new NotFoundError('User not found');
  return user;
};

export const deleteUser = async (userId: string): Promise<void> => {
  const user = await User.findByIdAndDelete(userId);
  if (!user) throw new NotFoundError('User not found');
};

// ── All providers (admin full list) ─────────────────────────────────────────

export const getAllProviders = async (limit: number = 200, skip: number = 0) => {
  return Provider.find()
    .populate('user', 'name email phone profilePicture isVerified')
    .limit(limit)
    .skip(skip)
    .sort({ createdAt: -1 });
};

// ── All bookings (admin full list) ───────────────────────────────────────────

export const getAllBookings = async (
  status?: string,
  limit: number = 200,
  skip: number = 0
) => {
  const query: any = {};
  if (status && status !== 'all') query.status = status;

  return Booking.find(query)
    .populate('customer', 'name email profilePicture')
    .populate({ path: 'provider', populate: { path: 'user', select: 'name email profilePicture' } })
    .limit(limit)
    .skip(skip)
    .sort({ createdAt: -1 });
};
