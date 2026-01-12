import { Rating, IRating } from '../models/Rating';
import { Booking } from '../models/Booking';
import { Provider } from '../models/Provider';
import { NotFoundError, ValidationError, ConflictError } from '../utils/errors';

export const createRating = async (
  bookingId: string,
  customerId: string,
  rating: number,
  review?: string
): Promise<IRating> => {
  // Verify booking exists and is completed
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new NotFoundError('Booking not found');
  }

  if (booking.customer.toString() !== customerId) {
    throw new ValidationError('You can only rate your own bookings');
  }

  if (booking.status !== 'completed') {
    throw new ValidationError('Can only rate completed bookings');
  }

  // Check if rating already exists
  const existingRating = await Rating.findOne({ booking: bookingId });
  if (existingRating) {
    throw new ConflictError('Rating already exists for this booking');
  }

  // Create rating
  const newRating = await Rating.create({
    booking: bookingId,
    customer: customerId,
    provider: booking.provider,
    rating,
    review,
  });

  // Update provider rating
  await updateProviderRating(booking.provider.toString());

  return newRating;
};

export const updateProviderRating = async (providerId: string): Promise<void> => {
  const ratings = await Rating.find({ provider: providerId });
  
  if (ratings.length === 0) {
    return;
  }

  const totalRating = ratings.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = totalRating / ratings.length;

  await Provider.findByIdAndUpdate(providerId, {
    rating: parseFloat(averageRating.toFixed(2)),
    totalRatings: ratings.length,
  });

  // Update badges based on rating
  const provider = await Provider.findById(providerId);
  if (provider) {
    const badges = [...(provider.badges || [])];

    if (averageRating >= 4.5 && !badges.includes('top-rated')) {
      badges.push('top-rated');
    }

    if (ratings.length >= 50 && !badges.includes('popular')) {
      badges.push('popular');
    }

    if (averageRating >= 4.0 && ratings.length >= 20 && !badges.includes('expert')) {
      badges.push('expert');
    }

    await Provider.findByIdAndUpdate(providerId, { badges });
  }
};

export const getProviderRatings = async (
  providerId: string,
  limit: number = 10,
  skip: number = 0
) => {
  const ratings = await Rating.find({ provider: providerId })
    .populate('customer', 'name')
    .populate('booking', 'service completedAt')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  return ratings;
};

