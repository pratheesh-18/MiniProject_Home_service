import { Router } from 'express';
import { param, body, query } from 'express-validator';
import {
  verifyProviderHandler,
  getBookingStats,
  getProviderStats,
  resolveDispute,
  getUsers,
  getUserByIdHandler,
  createUserHandler,
  updateUserHandler,
  deleteUserHandler,
  getProvidersHandler,
  getBookingsHandler,
} from '../controllers/adminController';
import { authenticate, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validator';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// ── Statistics ───────────────────────────────────────────────────────────────
router.get(
  '/statistics/bookings',
  validate([
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
  ]),
  getBookingStats
);

router.get('/statistics/providers', getProviderStats);

// ── Users CRUD ───────────────────────────────────────────────────────────────
router.get(
  '/users',
  validate([
    query('role').optional().isIn(['customer', 'provider', 'admin']),
    query('limit').optional().isInt({ min: 1, max: 200 }),
    query('skip').optional().isInt({ min: 0 }),
  ]),
  getUsers
);

router.post(
  '/users',
  validate([
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('role').isIn(['customer', 'provider', 'admin']).withMessage('Invalid role'),
  ]),
  createUserHandler
);

router.get(
  '/users/:userId',
  validate([param('userId').isMongoId().withMessage('Invalid user ID')]),
  getUserByIdHandler
);

router.patch(
  '/users/:userId',
  validate([
    param('userId').isMongoId().withMessage('Invalid user ID'),
    body('name').optional().trim().notEmpty(),
    body('email').optional().isEmail(),
    body('phone').optional().trim().notEmpty(),
    body('role').optional().isIn(['customer', 'provider', 'admin']),
  ]),
  updateUserHandler
);

router.delete(
  '/users/:userId',
  validate([param('userId').isMongoId().withMessage('Invalid user ID')]),
  deleteUserHandler
);

// ── Providers list ───────────────────────────────────────────────────────────
router.get(
  '/providers',
  validate([
    query('limit').optional().isInt({ min: 1, max: 200 }),
    query('skip').optional().isInt({ min: 0 }),
  ]),
  getProvidersHandler
);

router.patch(
  '/providers/:providerId/verify',
  validate([
    param('providerId').isMongoId().withMessage('Invalid provider ID'),
    body('verified').isBoolean().withMessage('Verified must be a boolean'),
  ]),
  verifyProviderHandler
);

// ── Bookings list ─────────────────────────────────────────────────────────────
router.get(
  '/bookings',
  validate([
    query('status').optional().isIn(['pending', 'confirmed', 'accepted', 'enRoute', 'inProgress', 'completed', 'cancelled', 'disputed', 'all']),
    query('limit').optional().isInt({ min: 1, max: 200 }),
    query('skip').optional().isInt({ min: 0 }),
  ]),
  getBookingsHandler
);

// ── Disputes ─────────────────────────────────────────────────────────────────
router.patch(
  '/disputes/:bookingId/resolve',
  validate([
    param('bookingId').isMongoId().withMessage('Invalid booking ID'),
    body('resolution').trim().notEmpty().withMessage('Resolution is required'),
    body('refundAmount').optional().isFloat({ min: 0 }),
  ]),
  resolveDispute
);

export default router;
