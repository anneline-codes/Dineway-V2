import express from 'express';
import {
  createReservation,
  getMyReservations,
  getRestaurantReservations,
  updateReservationStatus,
  cancelMyReservation,
} from '../controllers/reservationController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// User routes
router.post('/', createReservation);
router.get('/my', getMyReservations);
router.patch('/:id/cancel', cancelMyReservation);

// Restaurant owner/admin routes
router.get('/restaurant/:restaurantId', getRestaurantReservations);
router.patch('/:id/status', restrictTo('admin', 'super_admin'), updateReservationStatus);

export default router;