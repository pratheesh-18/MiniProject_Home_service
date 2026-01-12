import { Router } from 'express';
import { param, body, query } from 'express-validator';
import {
  verifyProviderHandler,
  getBookingStats,
  getProviderStats,
  resolveDispute,
  getUsers,
} from '../controllers/adminController';
import { authenticate, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validator';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

router.patch(
  '/providers/:providerId/verify',
  validate([
    param('providerId').isMongoId().withMessage('Invalid provider ID'),
    body('verified').isBoolean().withMessage('Verified must be a boolean'),
  ]),
  verifyProviderHandler
);

router.get(
  '/statistics/bookings',
  validate([
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
  ]),
  getBookingStats
);

router.get('/statistics/providers', getProviderStats);

router.patch(
  '/disputes/:bookingId/resolve',
  validate([
    param('bookingId').isMongoId().withMessage('Invalid booking ID'),
    body('resolution').trim().notEmpty().withMessage('Resolution is required'),
    body('refundAmount').optional().isFloat({ min: 0 }),
  ]),
  resolveDispute
);

router.get(
  '/users',
  validate([
    query('role').optional().isIn(['customer', 'provider', 'admin']),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('skip').optional().isInt({ min: 0 }),
  ]),
  getUsers
);

export default router;

