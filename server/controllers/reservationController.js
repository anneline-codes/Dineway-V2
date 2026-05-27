import Reservation from '../models/Reservation.js';
import Table from '../models/Table.js';
import Restaurant from '../models/Restaurant.js';
import asyncHandler from 'express-async-handler';

// @desc    Create a new reservation
// @route   POST /api/v1/reservations
// @access  Private
export const createReservation = asyncHandler(async (req, res) => {
  const { restaurantId, tableId, date, timeSlot, guestCount, notes } = req.body;

  // Check if table exists and belongs to restaurant
  const table = await Table.findOne({ _id: tableId, restaurantId });
  if (!table) {
    return res.status(404).json({
      success: false,
      error: 'Table not found or does not belong to this restaurant',
    });
  }

  // Check if table can accommodate guests
  if (table.capacity < guestCount) {
    return res.status(400).json({
      success: false,
      error: `Table capacity (${table.capacity}) is less than guest count (${guestCount})`,
    });
  }

  // Check if table is available
  const isAvailable = await Reservation.checkAvailability(
    restaurantId,
    date,
    timeSlot,
    tableId
  );

  if (!isAvailable) {
    return res.status(400).json({
      success: false,
      error: 'This table is not available for the selected time slot',
    });
  }

  // Create reservation
  const reservation = await Reservation.create({
    userId: req.user._id,
    restaurantId,
    tableId,
    date,
    timeSlot,
    guestCount,
    notes: notes || '',
  });

  // Populate restaurant info
  await reservation.populate('restaurantId', 'name address');

  res.status(201).json({
    success: true,
    data: reservation,
  });
});

// @desc    Get user's reservations
// @route   GET /api/v1/reservations/my
// @access  Private
export const getMyReservations = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  let query = { userId: req.user._id };

  if (status) {
    query.status = status;
  }

  const reservations = await Reservation.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate('restaurantId', 'name address coverImage')
    .populate('tableId', 'tableNumber capacity');

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

  // Check if user owns the restaurant or is admin
  const restaurant = await Restaurant.findOne({ _id: restaurantId });
  if (!restaurant) {
    return res.status(404).json({
      success: false,
      error: 'Restaurant not found',
    });
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

  let query = { restaurantId };

  if (status) {
    query.status = status;
  }

  if (date) {
    query.date = new Date(date);
  }

  const reservations = await Reservation.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate('userId', 'name email')
    .populate('tableId', 'tableNumber capacity');

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

  if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid status',
    });
  }

  const reservation = await Reservation.findById(id).populate('restaurantId');

  if (!reservation) {
    return res.status(404).json({
      success: false,
      error: 'Reservation not found',
    });
  }

  // Check ownership or admin
  const restaurant = reservation.restaurantId;
  if (
    restaurant.ownerId.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    return res.status(403).json({
      success: false,
      error: 'You do not have permission to update this reservation',
    });
  }

  reservation.status = status;
  await reservation.save();

  res.status(200).json({
    success: true,
    data: reservation,
  });
});

// @desc    Cancel user's own reservation
// @route   PATCH /api/v1/reservations/:id/cancel
// @access  Private
export const cancelMyReservation = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const reservation = await Reservation.findById(id);

  if (!reservation) {
    return res.status(404).json({
      success: false,
      error: 'Reservation not found',
    });
  }

  // Check ownership
  if (reservation.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      error: 'You do not have permission to cancel this reservation',
    });
  }

  // Only pending reservations can be cancelled by users
  if (reservation.status === 'confirmed') {
    return res.status(400).json({
      success: false,
      error: 'Confirmed reservations cannot be cancelled by users. Please contact the restaurant.',
    });
  }

  reservation.status = 'cancelled';
  await reservation.save();

  res.status(200).json({
    success: true,
    data: reservation,
  });
});