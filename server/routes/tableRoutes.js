import express from 'express';
import {
  getRestaurantTables,
  getAvailableTables,
  getRestaurantSections,
  createTable,
  updateTable,
  deleteTable,
} from '../controllers/tableController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/restaurant/:restaurantId', getRestaurantTables);
router.get('/sections/:restaurantId', getRestaurantSections);
router.get('/available', getAvailableTables);

// Protected routes
router.use(protect);
router.post('/', createTable);
router.put('/:id', updateTable);
router.delete('/:id', deleteTable);

export default router;
