import { Request, Response, NextFunction } from 'express';
import {
  searchProviders,
  getProviderById,
  updateProviderLocation,
  updateProviderAvailability,
} from '../services/providerService';
import { AuthRequest } from '../middlewares/auth';
import { Provider } from '../models/Provider';
import { NotFoundError } from '../utils/errors';

export const search = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      latitude,
      longitude,
      maxDistance,
      service,
      minRating,
      maxHourlyRate,
      isVerified,
      isAvailable,
      sortBy,
      limit,
      skip,
    } = req.query;

    if (!latitude || !longitude) {
      res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
      return;
    }

    const providers = await searchProviders({
      latitude: parseFloat(latitude as string),
      longitude: parseFloat(longitude as string),
      maxDistance: maxDistance ? parseFloat(maxDistance as string) : undefined,
      service: service as string,
      minRating: minRating ? parseFloat(minRating as string) : undefined,
      maxHourlyRate: maxHourlyRate ? parseFloat(maxHourlyRate as string) : undefined,
      isVerified: isVerified === 'true' ? true : isVerified === 'false' ? false : undefined,
      isAvailable: isAvailable === 'false' ? false : true,
      sortBy: (sortBy as 'distance' | 'rating' | 'hourlyRate') || 'distance',
      limit: limit ? parseInt(limit as string, 10) : 20,
      skip: skip ? parseInt(skip as string, 10) : 0,
    });

    res.status(200).json({
      success: true,
      count: providers.length,
      data: providers,
    });
  } catch (error) {
    next(error);
  }
};

// Get all providers (excluding current provider if logged in as provider)
export const getAllProviders = async (
  req: Request | AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    let excludeUserId = null;

    // If user is logged in as provider, exclude their own provider profile
    if (authReq.user && authReq.user.role === 'provider') {
      const currentProvider = await Provider.findOne({ user: authReq.user._id });
      if (currentProvider) {
        excludeUserId = currentProvider._id;
      }
    }

    const query: any = {};
    if (excludeUserId) {
      query._id = { $ne: excludeUserId };
    }

    const providers = await Provider.find(query)
      .populate('user', 'name email phone')
      .lean();

    res.status(200).json({
      success: true,
      count: providers.length,
      data: providers,
    });
  } catch (error) {
    next(error);
  }
};

export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const provider = await getProviderById(id);

    res.status(200).json({
      success: true,
      data: provider,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const provider = await Provider.findOne({ user: req.user!._id }).populate('user', 'name email phone');

    if (!provider) {
      res.status(404).json({
        success: false,
        message: 'Provider profile not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: provider,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { services, hourlyRate, experience, bio, availability } = req.body;

    const provider = await Provider.findOne({ user: req.user!._id });

    if (!provider) {
      res.status(404).json({
        success: false,
        message: 'Provider profile not found',
      });
      return;
    }

    // Update fields
    if (services !== undefined) provider.services = services;
    if (hourlyRate !== undefined) provider.hourlyRate = hourlyRate;
    if (experience !== undefined) provider.experience = experience;
    if (bio !== undefined) provider.bio = bio;
    if (availability !== undefined) provider.availability = availability;

    await provider.save();

    const updatedProvider = await Provider.findById(provider._id).populate('user', 'name email phone');

    res.status(200).json({
      success: true,
      data: updatedProvider,
    });
  } catch (error) {
    next(error);
  }
};

export const updateLocation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { longitude, latitude } = req.body;

    if (!longitude || !latitude) {
      res.status(400).json({
        success: false,
        message: 'Longitude and latitude are required',
      });
      return;
    }

    // Verify provider belongs to user
    const provider = await Provider.findOne({ user: req.user!._id });

    if (!provider || provider._id.toString() !== id) {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to update this provider location',
      });
      return;
    }

    const updatedProvider = await updateProviderLocation(id, longitude, latitude);

    res.status(200).json({
      success: true,
      data: updatedProvider,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAvailability = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;

    // Verify provider belongs to user
    const provider = await Provider.findOne({ user: req.user!._id });

    if (!provider || provider._id.toString() !== id) {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to update this provider availability',
      });
      return;
    }

    const updatedProvider = await updateProviderAvailability(id, isAvailable);

    res.status(200).json({
      success: true,
      data: updatedProvider,
    });
  } catch (error) {
    next(error);
  }
};
