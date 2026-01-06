import { Router } from 'express';
import * as reviewController from './review.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// POST /api/reviews - Create a review
router.post('/', authenticate, reviewController.createReview);

// GET /api/reviews/user/:userId - Get reviews for a specific user (public)
router.get('/user/:userId', reviewController.getUserReviews);

export default router;
