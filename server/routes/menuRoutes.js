import express from 'express';
import {
  getRestaurantMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '../controllers/menuController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/restaurant/:restaurantId', getRestaurantMenu);

// Protected routes (Owner or Admin only)
router.use(protect);

router.post('/', restrictTo('admin', 'super_admin'), createMenuItem);
router.put('/:id', restrictTo('admin', 'super_admin'), updateMenuItem);
router.delete('/:id', restrictTo('admin', 'super_admin'), deleteMenuItem);

export default router;