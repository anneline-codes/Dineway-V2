import express from 'express';
import {
  getRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  registerRestaurant,
  getRestaurantStats,
} from '../controllers/restaurantController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getRestaurants);
router.get('/stats/count', getRestaurantStats);
router.get('/:slug', getRestaurant);

// Protected routes
router.use(protect); // All routes below require authentication

router.post('/', createRestaurant);
router.put('/:id', updateRestaurant);
router.delete('/:id', restrictTo('admin'), deleteRestaurant);
router.patch('/:id/register', restrictTo('admin'), registerRestaurant);

export default router;