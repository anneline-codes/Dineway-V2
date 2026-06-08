import Reservation from '../models/Reservation.js';
import Table from '../models/Table.js';
import Restaurant from '../models/Restaurant.js';
import asyncHandler from 'express-async-handler';
import { io } from '../index.js';

// @desc    Create a new reservation
// @route   POST /api/v1/reservations
// @access  Private
export const createReservation = asyncHandler(async (req, res) => {
  const {
    restaurantId,
    tableId,
    date,
    timeSlot,
    startTime,
    endTime,
    guestCount,
    guestName,
    guestPhone,
    notes,
  } = req.body;

  const table = await Table.findOne({ _id: tableId, restaurantId });
  if (!table) {
    return res.status(404).json({
      success: false,
      error: 'Table not found or does not belong to this restaurant',
    });
  }

  if (table.capacity < guestCount) {
    return res.status(400).json({
      success: false,
      error: `Table capacity (${table.capacity}) is less than guest count (${guestCount})`,
    });
  }

  const isAvailable = await Reservation.checkAvailability(restaurantId, date, timeSlot, tableId);
  if (!isAvailable) {
    return res.status(400).json({
      success: false,
      error: 'This table is not available for the selected time slot',
    });
  }

  const reservation = await Reservation.create({
    userId: req.user._id,
    restaurantId,
    tableId,
    date,
    timeSlot,
    startTime: startTime || timeSlot,
    endTime: endTime || '',
    guestCount,
    guestName: guestName || req.user.name || '',
    guestPhone: guestPhone || '',
    notes: notes || '',
    status: 'confirmed',
  });

  await reservation.populate('restaurantId', 'name address');
  await reservation.populate('userId', 'name');
  await reservation.populate('tableId', 'tableNumber capacity section');

  // Real-time: notify restaurant admin
  const payload = {
    _id: reservation._id,
    bookingId: reservation.bookingId,
    clientId: reservation.userId,
    venueId: reservation.restaurantId,
    tableId: reservation.tableId,
    date: reservation.date,
    time: reservation.timeSlot,
    startTime: reservation.startTime,
    endTime: reservation.endTime,
    guests: reservation.guestCount,
    guestName: reservation.guestName,
    status: reservation.status,
  };

  io.to(`restaurant:${restaurantId}`).emit('booking:new', { booking: payload });
  io.to('superadmin').emit('booking:new', { booking: payload });

  res.status(201).json({ success: true, data: reservation });
});

// @desc    Get user's reservations
// @route   GET /api/v1/reservations/my
// @access  Private
export const getMyReservations = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  const query = { userId: req.user._id };
  if (status) query.status = status;

  const reservations = await Reservation.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate('restaurantId', 'name address coverImage')
    .populate('tableId', 'tableNumber capacity section');

  const total = await Reservation.countDocuments(query);

  res.status(200).json({
    success: true,
    count: reservations.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: reservations,
  });
});

// @desc    Get reservations for a restaurant (owner/admin)
// @route   GET /api/v1/reservations/restaurant/:restaurantId
// @access  Private (Owner or Admin)
export const getRestaurantReservations = asyncHandler(async (req, res) => {
  const { status, date, page = 1, limit = 20 } = req.query;
  const { restaurantId } = req.params;

  const restaurant = await Restaurant.findOne({ _id: restaurantId });
  if (!restaurant) {
    return res.status(404).json({ success: false, error: 'Restaurant not found' });
  }

  if (
    restaurant.ownerId.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    return res.status(403).json({
      success: false,
      error: 'You do not have permission to view these reservations',
    });
  }

  const query = { restaurantId };
  if (status) query.status = status;
  if (date) query.date = new Date(date);

  const reservations = await Reservation.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate('userId', 'name email')
    .populate('tableId', 'tableNumber capacity section');

  const total = await Reservation.countDocuments(query);

  res.status(200).json({
    success: true,
    count: reservations.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: reservations,
  });
});

// @desc    Update reservation status
// @route   PATCH /api/v1/reservations/:id/status
// @access  Private (Owner or Admin)
export const updateReservationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status' });
  }

  const reservation = await Reservation.findById(id).populate('restaurantId');
  if (!reservation) {
    return res.status(404).json({ success: false, error: 'Reservation not found' });
  }

  const restaurant = reservation.restaurantId;
  const allowedRoles = ['admin', 'restaurant_admin', 'restaurant_manager'];
  if (
    restaurant.ownerId.toString() !== req.user._id.toString() &&
    !allowedRoles.includes(req.user.role)
  ) {
    return res.status(403).json({
      success: false,
      error: 'You do not have permission to update this reservation',
    });
  }

  reservation.status = status;
  await reservation.save();

  res.status(200).json({ success: true, data: reservation });
});

// @desc    Cancel user's own reservation
// @route   PATCH /api/v1/reservations/:id/cancel
// @access  Private
export const cancelMyReservation = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const reservation = await Reservation.findById(id);
  if (!reservation) {
    return res.status(404).json({ success: false, error: 'Reservation not found' });
  }

  if (reservation.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      error: 'You do not have permission to cancel this reservation',
    });
  }

  reservation.status = 'cancelled';
  await reservation.save();

  res.status(200).json({ success: true, data: reservation });
});
