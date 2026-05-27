import express from 'express';
import {
  createReview,
  getRestaurantReviews,
  getLatestReviews,
  deleteReview,
} from '../controllers/reviewController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/latest', getLatestReviews);
router.get('/restaurant/:restaurantId', getRestaurantReviews);

// Protected routes
router.use(protect);

router.post('/', createReview);
router.delete('/:id', restrictTo('admin', 'customer'), deleteReview);

export default router;