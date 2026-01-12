import { Response, NextFunction } from 'express';
import {
  verifyProvider,
  getBookingStatistics,
  getProviderStatistics,
  handleDispute,
  getAllUsers,
} from '../services/adminService';
import { AuthRequest } from '../middlewares/auth';

export const verifyProviderHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { providerId } = req.params;
    const { verified } = req.body;

    await verifyProvider(providerId, verified);

    res.status(200).json({
      success: true,
      message: `Provider ${verified ? 'verified' : 'unverified'} successfully`,
    });
  } catch (error) {
    next(error);
  }
};

export const getBookingStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    const stats = await getBookingStatistics(
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const getProviderStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await getProviderStatistics();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const resolveDispute = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const { resolution, refundAmount } = req.body;

    await handleDispute(bookingId, resolution, refundAmount);

    res.status(200).json({
      success: true,
      message: 'Dispute resolved successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { role, limit = 50, skip = 0 } = req.query;

    const users = await getAllUsers(
      role as string,
      parseInt(limit as string, 10),
      parseInt(skip as string, 10)
    );

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

