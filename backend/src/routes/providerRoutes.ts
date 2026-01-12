import { Router } from 'express';
import { query, param, body } from 'express-validator';
import {
  search,
  getAllProviders,
  getById,
  getMyProfile,
  updateProfile,
  updateLocation,
  updateAvailability,
} from '../controllers/providerController';
import { authenticate, optionalAuthenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validator';

const router = Router();

// Get all providers (with optional auth to exclude current provider if provider role)
router.get(
  '/',
  optionalAuthenticate,
  getAllProviders
);

router.get(
  '/search',
  validate([
    query('latitude').isFloat().withMessage('Valid latitude is required'),
    query('longitude').isFloat().withMessage('Valid longitude is required'),
    query('maxDistance').optional().isFloat({ min: 0 }),
    query('minRating').optional().isFloat({ min: 0, max: 5 }),
    query('maxHourlyRate').optional().isFloat({ min: 0 }),
  ]),
  search
);

router.get(
  '/me',
  authenticate,
  getMyProfile
);

router.get(
  '/:id',
  validate([param('id').isMongoId().withMessage('Invalid provider ID')]),
  getById
);

router.patch(
  '/me',
  authenticate,
  validate([
    body('services').optional().isArray(),
    body('hourlyRate').optional().isFloat({ min: 0 }),
    body('experience').optional().isInt({ min: 0 }),
    body('bio').optional().isString().isLength({ max: 500 }),
  ]),
  updateProfile
);

router.patch(
  '/:id/location',
  authenticate,
  validate([
    param('id').isMongoId().withMessage('Invalid provider ID'),
    body('longitude').isFloat().withMessage('Valid longitude is required'),
    body('latitude').isFloat().withMessage('Valid latitude is required'),
  ]),
  updateLocation
);

router.patch(
  '/:id/availability',
  authenticate,
  validate([
    param('id').isMongoId().withMessage('Invalid provider ID'),
    body('isAvailable').isBoolean().withMessage('isAvailable must be a boolean'),
  ]),
  updateAvailability
);

export default router;

