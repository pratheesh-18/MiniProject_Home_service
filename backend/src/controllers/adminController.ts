import { Response, NextFunction } from 'express';
import {
  verifyProvider,
  getBookingStatistics,
  getProviderStatistics,
  handleDispute,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getAllProviders,
  getAllBookings,
} from '../services/adminService';
import { AuthRequest } from '../middlewares/auth';

// ── Provider verification ────────────────────────────────────────────────────

export const verifyProviderHandler = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { providerId } = req.params;
    const { verified } = req.body;
    await verifyProvider(providerId, verified);
    res.status(200).json({ success: true, message: `Provider ${verified ? 'verified' : 'unverified'} successfully` });
  } catch (error) { next(error); }
};

// ── Statistics ───────────────────────────────────────────────────────────────

export const getBookingStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    const stats = await getBookingStatistics(
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );
    res.status(200).json({ success: true, data: stats });
  } catch (error) { next(error); }
};

export const getProviderStats = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stats = await getProviderStatistics();
    res.status(200).json({ success: true, data: stats });
  } catch (error) { next(error); }
};

// ── Disputes ─────────────────────────────────────────────────────────────────

export const resolveDispute = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const { resolution, refundAmount } = req.body;
    await handleDispute(bookingId, resolution, refundAmount);
    res.status(200).json({ success: true, message: 'Dispute resolved successfully' });
  } catch (error) { next(error); }
};

// ── Users CRUD ───────────────────────────────────────────────────────────────

export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { role, limit = 200, skip = 0 } = req.query;
    const users = await getAllUsers(role as string, parseInt(limit as string, 10), parseInt(skip as string, 10));
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) { next(error); }
};

export const getUserByIdHandler = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;
    const user = await getUserById(userId);
    res.status(200).json({ success: true, data: user });
  } catch (error) { next(error); }
};

export const createUserHandler = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, phone, role } = req.body;
    const user = await createUser({ name, email, password, phone, role });
    res.status(201).json({ success: true, data: user });
  } catch (error) { next(error); }
};

export const updateUserHandler = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;
    const { name, email, phone, role } = req.body;
    const user = await updateUser(userId, { name, email, phone, role });
    res.status(200).json({ success: true, data: user });
  } catch (error) { next(error); }
};

export const deleteUserHandler = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;
    await deleteUser(userId);
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) { next(error); }
};

// ── Providers list (admin) ───────────────────────────────────────────────────

export const getProvidersHandler = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { limit = 200, skip = 0 } = req.query;
    const providers = await getAllProviders(parseInt(limit as string, 10), parseInt(skip as string, 10));
    res.status(200).json({ success: true, count: providers.length, data: providers });
  } catch (error) { next(error); }
};

// ── Bookings list (admin) ────────────────────────────────────────────────────

export const getBookingsHandler = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, limit = 200, skip = 0 } = req.query;
    const bookings = await getAllBookings(status as string, parseInt(limit as string, 10), parseInt(skip as string, 10));
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) { next(error); }
};
