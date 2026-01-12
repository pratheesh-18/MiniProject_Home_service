import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  create,
  accept,
  start,
  complete,
  cancel,
  getById,
  getMyBookings,
} from '../controllers/bookingController';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validator';
import { emergencyLimiter } from '../middlewares/rateLimiter';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post(
  '/',
  validate([
    body('providerId')
      .if(body('emergency').equals(false))
      .isMongoId()
      .withMessage('Valid provider ID is required for non-emergency bookings'),
    body('service').trim().notEmpty().withMessage('Service is required'),
    body('location.coordinates')
      .isArray({ min: 2, max: 2 })
      .withMessage('Location coordinates must be [longitude, latitude]'),
    body('location.address')
      .trim()
      .notEmpty()
      .withMessage('Address is required'),
    body('estimatedDuration')
      .isInt({ min: 15 })
      .withMessage('Estimated duration must be at least 15 minutes'),
  ]),
  create
);

router.post(
  '/emergency',
  emergencyLimiter,
  validate([
    body('service').trim().notEmpty().withMessage('Service is required'),
    body('location.coordinates')
      .isArray({ min: 2, max: 2 })
      .withMessage('Location coordinates must be [longitude, latitude]'),
    body('location.address')
      .trim()
      .notEmpty()
      .withMessage('Address is required'),
    body('estimatedDuration')
      .isInt({ min: 15 })
      .withMessage('Estimated duration must be at least 15 minutes'),
  ]),
  (req, res, next) => {
    req.body.emergency = true;
    next();
  },
  create
);

router.get(
  '/',
  validate([
    query('status').optional().isIn(['pending', 'accepted', 'started', 'completed', 'cancelled', 'disputed']),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('skip').optional().isInt({ min: 0 }),
  ]),
  getMyBookings
);

router.get(
  '/:id',
  validate([param('id').isMongoId().withMessage('Invalid booking ID')]),
  getById
);

router.patch(
  '/:id/accept',
  validate([param('id').isMongoId().withMessage('Invalid booking ID')]),
  accept
);

router.patch(
  '/:id/start',
  validate([param('id').isMongoId().withMessage('Invalid booking ID')]),
  start
);

router.patch(
  '/:id/complete',
  validate([
    param('id').isMongoId().withMessage('Invalid booking ID'),
    body('actualDuration').optional().isInt({ min: 0 }),
  ]),
  complete
);

router.patch(
  '/:id/cancel',
  validate([param('id').isMongoId().withMessage('Invalid booking ID')]),
  cancel
);

export default router;

