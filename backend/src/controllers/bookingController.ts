import { Response, NextFunction } from 'express';
import {
  createBooking,
  acceptBooking,
  startBooking,
  completeBooking,
  cancelBooking,
  createEmergencyBooking,
} from '../services/bookingService';
import { AuthRequest } from '../middlewares/auth';
import { Booking } from '../models/Booking';

export const create = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      providerId,
      service,
      location,
      estimatedDuration,
      scheduledAt,
      notes,
      emergency,
    } = req.body;

    const booking = emergency
      ? await createEmergencyBooking(
        req.user!._id.toString(),
        service,
        location,
        estimatedDuration,
        notes
      )
      : await createBooking(
        req.user!._id.toString(),
        providerId,
        service,
        location,
        estimatedDuration,
        scheduledAt ? new Date(scheduledAt) : undefined,
        notes,
        emergency
      );

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const accept = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Get provider ID from user
    const Provider = require('../models/Provider').Provider;
    const provider = await Provider.findOne({ user: req.user!._id });

    if (!provider) {
      res.status(404).json({
        success: false,
        message: 'Provider profile not found',
      });
      return;
    }

    const booking = await acceptBooking(id, provider._id.toString());

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const start = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Get provider ID from user
    const Provider = require('../models/Provider').Provider;
    const provider = await Provider.findOne({ user: req.user!._id });

    if (!provider) {
      res.status(404).json({
        success: false,
        message: 'Provider profile not found',
      });
      return;
    }

    const booking = await startBooking(id, provider._id.toString());

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const complete = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { actualDuration } = req.body;

    // Get provider ID from user
    const Provider = require('../models/Provider').Provider;
    const provider = await Provider.findOne({ user: req.user!._id });

    if (!provider) {
      res.status(404).json({
        success: false,
        message: 'Provider profile not found',
      });
      return;
    }

    const booking = await completeBooking(
      id,
      provider._id.toString(),
      actualDuration
    );

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const cancel = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const booking = await cancelBooking(id, req.user!._id.toString(), req.user!.role);

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const getById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate('customer', 'name email phone')
      .populate('provider', 'user services hourlyRate')
      .populate({
        path: 'provider',
        populate: { path: 'user', select: 'name email phone' },
      });

    if (!booking) {
      res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, limit = 20, skip = 0 } = req.query;

    const query: any = {};

    const roleFilter = req.query.role as string;

    if (roleFilter === 'provider') {
      // Explicitly requested provider view
      // Verify user has a provider profile
      const Provider = require('../models/Provider').Provider;
      const provider = await Provider.findOne({ user: req.user!._id });
      if (provider) {
        query.provider = provider._id;
      } else {
        // User requested provider view but is not a provider
        res.status(200).json({
          success: true,
          count: 0,
          data: [],
        });
        return;
      }
    } else {
      // Default to customer behavior (view their own bookings)
      // This covers 'customer' role request and any fallback
      query.customer = req.user!._id;
    }

    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('customer', 'name email phone')
      .populate({
        path: 'provider',
        populate: { path: 'user', select: 'name email phone' },
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string, 10))
      .skip(parseInt(skip as string, 10));

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

