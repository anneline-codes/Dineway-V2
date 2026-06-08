import express from 'express';
import Restaurant from '../models/Restaurant.js';
import User from '../models/User.js';
import {
  getRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  registerRestaurant,
  getRestaurantStats,
} from '../controllers/restaurantController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import asyncHandler from 'express-async-handler';

const router = express.Router();

// ── Public routes ─────────────────────────────────────────────────────────────
router.get('/stats/count', getRestaurantStats);

// ── Restaurant admin: own restaurant ─────────────────────────────────────────
router.get('/me', protect, asyncHandler(async (req, res) => {
  const restaurantId = req.user.restaurantId;
  if (!restaurantId) return res.status(404).json({ success: false, error: 'No restaurant linked to account' });
  const venue = await Restaurant.findById(restaurantId);
  if (!venue) return res.status(404).json({ success: false, error: 'Restaurant not found' });
  res.json({ success: true, data: { venue } });
}));

router.put('/me', protect, asyncHandler(async (req, res) => {
  const restaurantId = req.user.restaurantId;
  if (!restaurantId) return res.status(403).json({ success: false, error: 'No restaurant linked' });
  const venue = await Restaurant.findByIdAndUpdate(restaurantId, req.body, { new: true, runValidators: true });
  res.json({ success: true, data: { venue } });
}));

// ── Superadmin routes ─────────────────────────────────────────────────────────
// GET /restaurants/admin/all?type=restaurant|hotel&status=&page=
router.get('/admin/all', protect, restrictTo('super_admin'), asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (search) filter.$or = [
    { name: { $regex: search, $options: 'i' } },
    { 'address.city': { $regex: search, $options: 'i' } },
  ];

  const total = await Restaurant.countDocuments(filter);
  const venues = await Restaurant.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate('ownerId', 'name email');

  // Map to superadmin UI shape
  const mapped = venues.map(v => ({
    _id: v._id,
    name: v.name,
    email: v.email,
    location: { city: v.address?.city || '', country: v.address?.country || '' },
    cuisine: v.category || '',
    phone: v.phone,
    status: v.status,
    rating: v.rating,
    orderCount: 0,
    revenue: 0,
  }));

  res.json({ success: true, data: { venues: mapped, total } });
}));

// POST /restaurants/admin  — superadmin creates restaurant + optional admin user
router.post('/admin', protect, restrictTo('super_admin'), asyncHandler(async (req, res) => {
  const { adminName, adminEmail, adminPassword, ...venueData } = req.body;

  let ownerId;
  if (adminEmail && adminPassword) {
    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
      ownerId = existing._id;
    } else {
      const adminUser = await User.create({
        name: adminName || 'Restaurant Admin',
        email: adminEmail,
        passwordHash: adminPassword,
        role: 'restaurant_manager',
      });
      ownerId = adminUser._id;
    }
  }

  const venue = await Restaurant.create({
    name: venueData.name,
    description: venueData.description || `${venueData.name} - Restaurant`,
    category: venueData.cuisine || 'Casual',
    address: {
      street: venueData.location?.street || '',
      city: venueData.location?.city || '',
      country: venueData.location?.country || 'Rwanda',
    },
    phone: venueData.phone || '',
    email: venueData.email || '',
    status: venueData.status || 'pending',
    ownerId,
  });

  // Link restaurant to admin user
  if (ownerId) {
    await User.findByIdAndUpdate(ownerId, { restaurantId: venue._id });
  }

  res.status(201).json({ success: true, data: venue });
}));

// PUT /restaurants/admin/:id
router.put('/admin/:id', protect, restrictTo('super_admin'), asyncHandler(async (req, res) => {
  const { location, cuisine, ...rest } = req.body;
  const update = { ...rest };
  if (cuisine) update.category = cuisine;
  if (location) update.address = { ...location };

  const venue = await Restaurant.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
  if (!venue) return res.status(404).json({ success: false, error: 'Not found' });
  res.json({ success: true, data: venue });
}));

// PATCH /restaurants/admin/:id/status
router.patch('/admin/:id/status', protect, restrictTo('super_admin'), asyncHandler(async (req, res) => {
  const venue = await Restaurant.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!venue) return res.status(404).json({ success: false, error: 'Not found' });
  res.json({ success: true, data: venue });
}));

// DELETE /restaurants/admin/:id
router.delete('/admin/:id', protect, restrictTo('super_admin'), asyncHandler(async (req, res) => {
  await Restaurant.findByIdAndDelete(req.params.id);
  res.json({ success: true, data: {} });
}));

// ── Public: list + single ─────────────────────────────────────────────────────
router.get('/', getRestaurants);
router.get('/:slug', getRestaurant);

// ── Auth required ─────────────────────────────────────────────────────────────
router.use(protect);
router.post('/', createRestaurant);
router.put('/:id', updateRestaurant);
router.delete('/:id', restrictTo('admin', 'super_admin'), deleteRestaurant);
router.patch('/:id/register', restrictTo('admin', 'super_admin'), registerRestaurant);

export default router;
