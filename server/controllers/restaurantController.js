import Restaurant from '../models/Restaurant.js';
import asyncHandler from 'express-async-handler';

// @desc    Get all restaurants with filtering, sorting, and pagination
// @route   GET /api/v1/restaurants?search=&category=&status=&sort=&page=&limit=
// @access  Public
export const getRestaurants = asyncHandler(async (req, res) => {
  const { search, category, status, sort, page = 1, limit = 12 } = req.query;

  // Build query
  let query = {};

  // Search by name or description
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  // Filter by category
  if (category) {
    query.category = category;
  }

  // Filter by status
  if (status) {
    query.status = status;
  }

  // Only show registered restaurants to non-admin users
  if (req.user?.role !== 'admin') {
    query.status = 'registered';
  }

  // Sorting
  let sortOptions = {};
  if (sort) {
    const sortBy = sort.split(',');
    sortBy.forEach(item => {
      const [field, order] = item.split(':');
      sortOptions[field] = order === 'desc' ? -1 : 1;
    });
  } else {
    sortOptions = { createdAt: -1 };
  }

  // Pagination
  const skip = (page - 1) * limit;
  const total = await Restaurant.countDocuments(query);

  const restaurants = await Restaurant.find(query)
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit))
    .populate('ownerId', 'name email');

  res.status(200).json({
    success: true,
    count: restaurants.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: restaurants,
  });
});

// @desc    Get single restaurant by slug
// @route   GET /api/v1/restaurants/:slug
// @access  Public
export const getRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findOne({ slug: req.params.slug })
    .populate('ownerId', 'name email');

  if (!restaurant) {
    return res.status(404).json({
      success: false,
      error: 'Restaurant not found',
    });
  }

  res.status(200).json({
    success: true,
    data: restaurant,
  });
});

// @desc    Create a new restaurant
// @route   POST /api/v1/restaurants
// @access  Private (Admin/Owner)
export const createRestaurant = asyncHandler(async (req, res) => {
  // Add user as owner if they're creating a restaurant
  const restaurantData = {
    ...req.body,
    ownerId: req.user._id,
  };

  const restaurant = await Restaurant.create(restaurantData);

  res.status(201).json({
    success: true,
    data: restaurant,
  });
});

// @desc    Update a restaurant
// @route   PUT /api/v1/restaurants/:id
// @access  Private (Owner or Admin)
export const updateRestaurant = asyncHandler(async (req, res) => {
  let restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    return res.status(404).json({
      success: false,
      error: 'Restaurant not found',
    });
  }

  // Check ownership or admin
  if (
    restaurant.ownerId.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    return res.status(403).json({
      success: false,
      error: 'You do not have permission to update this restaurant',
    });
  }

  restaurant = await Restaurant.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: restaurant,
  });
});

// @desc    Delete a restaurant
// @route   DELETE /api/v1/restaurants/:id
// @access  Private (Admin only)
export const deleteRestaurant = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Only admins can delete restaurants',
    });
  }

  const restaurant = await Restaurant.findByIdAndDelete(req.params.id);

  if (!restaurant) {
    return res.status(404).json({
      success: false,
      error: 'Restaurant not found',
    });
  }

  res.status(200).json({
    success: true,
    data: {},
    message: 'Restaurant deleted successfully',
  });
});

// @desc    Register a restaurant (change status to registered)
// @route   PATCH /api/v1/restaurants/:id/register
// @access  Private (Admin only)
export const registerRestaurant = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Only admins can register restaurants',
    });
  }

  const restaurant = await Restaurant.findByIdAndUpdate(
    req.params.id,
    { status: 'registered' },
    { new: true, runValidators: true }
  );

  if (!restaurant) {
    return res.status(404).json({
      success: false,
      error: 'Restaurant not found',
    });
  }

  res.status(200).json({
    success: true,
    data: restaurant,
  });
});

// @desc    Get restaurant statistics
// @route   GET /api/v1/restaurants/stats/count
// @access  Public
export const getRestaurantStats = asyncHandler(async (req, res) => {
  const total = await Restaurant.countDocuments();
  const registered = await Restaurant.countDocuments({ status: 'registered' });
  const pending = await Restaurant.countDocuments({ status: 'pending' });

  // Count new restaurants this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const newThisMonth = await Restaurant.countDocuments({
    createdAt: { $gte: startOfMonth },
  });

  res.status(200).json({
    success: true,
    data: {
      total,
      registered,
      pending,
      newThisMonth,
    },
  });
});