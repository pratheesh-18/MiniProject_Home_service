import { Provider, IProvider } from '../models/Provider';
import { User } from '../models/User';
import { calculateDistance, addDistanceToProvider } from '../utils/haversine';
import { NotFoundError, ValidationError } from '../utils/errors';

export interface ProviderSearchFilters {
  latitude: number;
  longitude: number;
  maxDistance?: number; // in km
  service?: string;
  minRating?: number;
  maxHourlyRate?: number;
  isVerified?: boolean;
  isAvailable?: boolean;
  sortBy?: 'distance' | 'rating' | 'hourlyRate';
  limit?: number;
  skip?: number;
}

export const searchProviders = async (filters: ProviderSearchFilters) => {
  const {
    latitude,
    longitude,
    maxDistance = 50, // default 50km
    service,
    minRating = 0,
    maxHourlyRate,
    isVerified,
    isAvailable = true,
    sortBy = 'distance',
    limit = 20,
    skip = 0,
  } = filters;

  // Build query
  const query: any = {};

  if (isVerified !== undefined) {
    query.isVerified = isVerified;
  }

  if (isAvailable !== undefined) {
    query.isAvailable = isAvailable;
  }

  if (service) {
    query.services = { $in: [service] };
  }

  if (maxHourlyRate !== undefined) {
    query.hourlyRate = { $lte: maxHourlyRate };
  }

  query.rating = { $gte: minRating };

  // Geospatial query for location
  const providers = await Provider.find({
    ...query,
    currentLocation: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        $maxDistance: maxDistance * 1000, // Convert km to meters
      },
    },
  })
    .populate('user', 'name email phone')
    .limit(limit)
    .skip(skip)
    .lean();

  // Add distance to each provider
  const providersWithDistance = providers.map((provider) =>
    addDistanceToProvider(provider, latitude, longitude)
  );

  // Filter by maxDistance manually (since $maxDistance might not be exact)
  const filteredProviders = providersWithDistance.filter(
    (p) => !p.distance || p.distance <= maxDistance
  );

  // Sort
  let sortedProviders = [...filteredProviders];
  if (sortBy === 'distance') {
    sortedProviders.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
  } else if (sortBy === 'rating') {
    sortedProviders.sort((b, a) => (a.rating || 0) - (b.rating || 0));
  } else if (sortBy === 'hourlyRate') {
    sortedProviders.sort((a, b) => (a.hourlyRate || 0) - (b.hourlyRate || 0));
  }

  return sortedProviders;
};

export const getProviderById = async (providerId: string): Promise<IProvider> => {
  const provider = await Provider.findById(providerId).populate('user', 'name email phone');

  if (!provider) {
    throw new NotFoundError('Provider not found');
  }

  return provider;
};

export const updateProviderLocation = async (
  providerId: string,
  longitude: number,
  latitude: number
): Promise<IProvider> => {
  const provider = await Provider.findByIdAndUpdate(
    providerId,
    {
      currentLocation: {
        type: 'Point',
        coordinates: [longitude, latitude],
        updatedAt: new Date(),
      },
    },
    { new: true }
  );

  if (!provider) {
    throw new NotFoundError('Provider not found');
  }

  return provider;
};

export const updateProviderAvailability = async (
  providerId: string,
  isAvailable: boolean
): Promise<IProvider> => {
  const provider = await Provider.findByIdAndUpdate(
    providerId,
    { isAvailable },
    { new: true }
  );

  if (!provider) {
    throw new NotFoundError('Provider not found');
  }

  return provider;
};

