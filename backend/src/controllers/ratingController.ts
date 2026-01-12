import { Request, Response, NextFunction } from 'express';
import { createRating, getProviderRatings } from '../services/ratingService';
import { AuthRequest } from '../middlewares/auth';

export const create = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { bookingId, rating, review } = req.body;

    const newRating = await createRating(
      bookingId,
      req.user!._id.toString(),
      rating,
      review
    );

    res.status(201).json({
      success: true,
      data: newRating,
    });
  } catch (error) {
    next(error);
  }
};

export const getByProvider = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { providerId } = req.params;
    const { limit = 10, skip = 0 } = req.query;

    const ratings = await getProviderRatings(
      providerId,
      parseInt(limit as string, 10),
      parseInt(skip as string, 10)
    );

    res.status(200).json({
      success: true,
      count: ratings.length,
      data: ratings,
    });
  } catch (error) {
    next(error);
  }
};

