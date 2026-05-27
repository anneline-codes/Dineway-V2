import express from 'express';
import {
  getRestaurantTables,
  getAvailableTables,
  createTable,
  updateTable,
  deleteTable,
} from '../controllers/tableController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/restaurant/:restaurantId', getRestaurantTables);
router.get('/available', getAvailableTables);

// Protected routes (Admin only)
router.use(protect);

router.post('/', restrictTo('admin'), createTable);
router.put('/:id', restrictTo('admin'), updateTable);
router.delete('/:id', restrictTo('admin'), deleteTable);

export default router;