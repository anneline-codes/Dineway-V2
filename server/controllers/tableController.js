import Table from '../models/Table.js';
import Restaurant from '../models/Restaurant.js';
import Reservation from '../models/Reservation.js';
import asyncHandler from 'express-async-handler';

// @desc    Get all tables for a restaurant
// @route   GET /api/v1/tables/restaurant/:restaurantId
// @access  Public
export const getRestaurantTables = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;

  // Check if restaurant exists
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    return res.status(404).json({
      success: false,
      error: 'Restaurant not found',
    });
  }

  const tables = await Table.find({ restaurantId }).sort({ tableNumber: 1 });

  res.status(200).json({
    success: true,
    count: tables.length,
    data: tables,
  });
});

// @desc    Get available tables for a specific date and time
// @route   GET /api/v1/tables/available?restaurantId=&date=&timeSlot=
// @access  Public
export const getAvailableTables = asyncHandler(async (req, res) => {
  const { restaurantId, date, timeSlot, guestCount } = req.query;

  if (!restaurantId || !date || !timeSlot) {
    return res.status(400).json({
      success: false,
      error: 'Please provide restaurantId, date, and timeSlot',
    });
  }

  // Get all tables for the restaurant
  let tables = await Table.find({ restaurantId, isAvailable: true });

  // Filter by guest count if provided
  if (guestCount) {
    tables = tables.filter(table => table.capacity >= parseInt(guestCount));
  }

  // Get booked tables for the date and time
  const bookedReservations = await Reservation.find({
    restaurantId,
    date: new Date(date),
    timeSlot,
    status: { $in: ['pending', 'confirmed'] },
  }).select('tableId');

  const bookedTableIds = bookedReservations.map(res => res.tableId.toString());

  // Filter out booked tables
  const availableTables = tables.filter(
    table => !bookedTableIds.includes(table._id.toString())
  );

  res.status(200).json({
    success: true,
    count: availableTables.length,
    data: availableTables,
  });
});

// @desc    Create a new table
// @route   POST /api/v1/tables
// @access  Private (Admin only)
export const createTable = asyncHandler(async (req, res) => {
  const { restaurantId } = req.body;

  // Check if restaurant exists
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    return res.status(404).json({
      success: false,
      error: 'Restaurant not found',
    });
  }

  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Only admins can create tables',
    });
  }

  const table = await Table.create(req.body);

  res.status(201).json({
    success: true,
    data: table,
  });
});

// @desc    Update a table
// @route   PUT /api/v1/tables/:id
// @access  Private (Admin only)
export const updateTable = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Only admins can update tables',
    });
  }

  const table = await Table.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!table) {
    return res.status(404).json({
      success: false,
      error: 'Table not found',
    });
  }

  res.status(200).json({
    success: true,
    data: table,
  });
});

// @desc    Delete a table
// @route   DELETE /api/v1/tables/:id
// @access  Private (Admin only)
export const deleteTable = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Only admins can delete tables',
    });
  }

  const table = await Table.findByIdAndDelete(req.params.id);

  if (!table) {
    return res.status(404).json({
      success: false,
      error: 'Table not found',
    });
  }

  res.status(200).json({
    success: true,
    data: {},
    message: 'Table deleted successfully',
  });
});