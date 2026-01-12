import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { create, getByProvider } from '../controllers/ratingController';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validator';

const router = Router();

router.post(
  '/',
  authenticate,
  validate([
    body('bookingId').isMongoId().withMessage('Valid booking ID is required'),
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('review').optional().isString().isLength({ max: 1000 }),
  ]),
  create
);

router.get(
  '/provider/:providerId',
  validate([
    param('providerId').isMongoId().withMessage('Invalid provider ID'),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('skip').optional().isInt({ min: 0 }),
  ]),
  getByProvider
);

export default router;

