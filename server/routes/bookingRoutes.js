import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import Reservation from '../models/Reservation.js';
import Table from '../models/Table.js';
import { io } from '../index.js';

const router = express.Router();
router.use(protect);

// GET /api/v1/bookings/all  — superadmin: all bookings
router.get('/all', restrictTo('super_admin'), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const total = await Reservation.countDocuments(filter);
    const bookings = await Reservation.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('userId', 'name')
      .populate('restaurantId', 'name')
      .populate('tableId', 'tableNumber capacity section');

    const mapped = bookings.map(b => ({
      _id: b._id,
      bookingId: b.bookingId,
      clientId: b.userId,
      venueId: b.restaurantId,
      tableId: b.tableId,
      date: b.date,
      time: b.timeSlot,
      startTime: b.startTime,
      endTime: b.endTime,
      guests: b.guestCount,
      guestName: b.guestName,
      status: b.status,
      createdAt: b.createdAt,
    }));

    res.json({ success: true, data: { bookings: mapped, total } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/bookings/restaurant  — restaurant admin: their bookings
router.get('/restaurant', async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const filter = restaurantId ? { restaurantId } : {};
    const bookings = await Reservation.find(filter)
      .sort({ createdAt: -1 })
      .populate('userId', 'name')
      .populate('tableId', 'tableNumber capacity section');

    const mapped = bookings.map(b => ({
      _id: b._id,
      bookingId: b.bookingId,
      clientId: b.userId,
      tableId: b.tableId,
      date: b.date,
      time: b.timeSlot,
      startTime: b.startTime,
      endTime: b.endTime,
      guests: b.guestCount,
      guestName: b.guestName,
      status: b.status,
    }));

    res.json({ success: true, data: { bookings: mapped } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/bookings/tables/:restaurantId — admin table map with live status
router.get('/tables/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const tables = await Table.find({ restaurantId }).sort({ tableNumber: 1 });
    res.json({ success: true, data: tables });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/v1/bookings/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const booking = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).populate('restaurantId', 'name');

    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });

    if (booking.restaurantId) {
      io.to(`restaurant:${booking.restaurantId._id}`).emit('booking:updated', { booking });
    }
    io.to('superadmin').emit('booking:updated', { booking });

    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
