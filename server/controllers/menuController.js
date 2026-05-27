import MenuItem from '../models/MenuItem.js';
import Restaurant from '../models/Restaurant.js';
import asyncHandler from 'express-async-handler';

// @desc    Get menu items for a restaurant, grouped by category
// @route   GET /api/v1/menu/restaurant/:restaurantId
// @access  Public
export const getRestaurantMenu = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  const { category } = req.query;

  // Check if restaurant exists
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    return res.status(404).json({
      success: false,
      error: 'Restaurant not found',
    });
  }

  // Build query
  let query = { restaurantId, isAvailable: true };

  if (category && category !== 'All') {
    query.category = category;
  }

  // Get menu items
  const menuItems = await MenuItem.find(query)
    .sort({ category: 1, name: 1 });

  // Group by category
  const groupedMenu = {};
  const categories = ['Starters', 'Mains', 'Desserts', 'Drinks', 'Specials'];

  categories.forEach(cat => {
    const items = menuItems.filter(item => item.category === cat);
    if (items.length > 0) {
      groupedMenu[cat] = items;
    }
  });

  // If no category filter, return grouped; otherwise return flat list
  if (category && category !== 'All') {
    res.status(200).json({
      success: true,
      count: menuItems.length,
      data: menuItems,
    });
  } else {
    res.status(200).json({
      success: true,
      count: menuItems.length,
      data: groupedMenu,
    });
  }
});

// @desc    Create a new menu item
// @route   POST /api/v1/menu
// @access  Private (Owner or Admin)
export const createMenuItem = asyncHandler(async (req, res) => {
  const { restaurantId } = req.body;

  // Check if restaurant exists
  const restaurant = await Restaurant.findById(restaurantId);
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
      error: 'You do not have permission to add menu items to this restaurant',
    });
  }

  const menuItem = await MenuItem.create(req.body);

  res.status(201).json({
    success: true,
    data: menuItem,
  });
});

// @desc    Update a menu item
// @route   PUT /api/v1/menu/:id
// @access  Private (Owner or Admin)
export const updateMenuItem = asyncHandler(async (req, res) => {
  let menuItem = await MenuItem.findById(req.params.id).populate('restaurantId');

  if (!menuItem) {
    return res.status(404).json({
      success: false,
      error: 'Menu item not found',
    });
  }

  // Check ownership or admin
  const restaurant = menuItem.restaurantId;
  if (
    restaurant.ownerId.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    return res.status(403).json({
      success: false,
      error: 'You do not have permission to update this menu item',
    });
  }

  menuItem = await MenuItem.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: menuItem,
  });
});

// @desc    Delete a menu item
// @route   DELETE /api/v1/menu/:id
// @access  Private (Owner or Admin)
export const deleteMenuItem = asyncHandler(async (req, res) => {
  const menuItem = await MenuItem.findById(req.params.id).populate('restaurantId');

  if (!menuItem) {
    return res.status(404).json({
      success: false,
      error: 'Menu item not found',
    });
  }

  // Check ownership or admin
  const restaurant = menuItem.restaurantId;
  if (
    restaurant.ownerId.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    return res.status(403).json({
      success: false,
      error: 'You do not have permission to delete this menu item',
    });
  }

  await MenuItem.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {},
    message: 'Menu item deleted successfully',
  });
});