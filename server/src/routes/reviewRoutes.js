import { Router } from 'express';
import { body } from 'express-validator';
import {
  listReviews,
  upsertReview,
  deleteReview,
} from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router({ mergeParams: true });

router.get('/', listReviews);

router.post(
  '/',
  protect,
  [
    body('rating').isInt({ min: 1, max: 5 }),
    body('comment').optional().isString(),
  ],
  validate,
  upsertReview
);

router.delete('/:reviewId', protect, deleteReview);

export default router;
