import express from 'express';
import Review from '../models/Review.js';
import Restaurant from '../models/Restaurant.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import asyncHandler from 'express-async-handler';

const router = express.Router();

// GET /api/v1/reviews/latest  — approved reviews for homepage
router.get('/latest', asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 3;
  const reviews = await Review.find({ status: 'approved' })
    .sort({ rating: -1, createdAt: -1 })
    .limit(limit)
    .populate('userId', 'name avatar')
    .populate('restaurantId', 'name slug');
  res.json({ success: true, count: reviews.length, data: reviews });
}));

// GET /api/v1/reviews/moderation?status=pending|approved|rejected&page=1  — superadmin
router.get('/moderation', protect, restrictTo('super_admin'), asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (search) filter.comment = { $regex: search, $options: 'i' };
  const total = await Review.countDocuments(filter);
  const reviews = await Review.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate('userId', 'name')
    .populate('restaurantId', 'name');
  // Map fields to match superadmin UI expectations
  const mapped = reviews.map(r => ({
    _id: r._id,
    clientId: r.userId,
    venueId: r.restaurantId,
    rating: r.rating,
    text: r.comment,
    status: r.status,
    createdAt: r.createdAt,
  }));
  res.json({ success: true, data: { reviews: mapped, total } });
}));

// GET /api/v1/reviews/restaurant/:restaurantId — public, only approved
router.get('/restaurant/:restaurantId', asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const filter = { restaurantId: req.params.restaurantId, status: 'approved' };
  const total = await Review.countDocuments(filter);
  const reviews = await Review.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate('userId', 'name avatar');
  res.json({ success: true, count: reviews.length, total, page: parseInt(page), pages: Math.ceil(total / limit), data: reviews });
}));

// GET /api/v1/reviews/restaurant-mine  — restaurant admin: all reviews for their restaurant
router.get('/restaurant-mine', protect, asyncHandler(async (req, res) => {
  // user must have restaurantId attached
  const restaurantId = req.user.restaurantId;
  if (!restaurantId) return res.status(400).json({ success: false, error: 'No restaurant linked to this account' });
  const reviews = await Review.find({ restaurantId })
    .sort({ createdAt: -1 })
    .populate('userId', 'name');
  const mapped = reviews.map(r => ({
    _id: r._id,
    clientId: r.userId,
    rating: r.rating,
    text: r.comment,
    status: r.status,
    createdAt: r.createdAt,
  }));
  res.json({ success: true, data: { reviews: mapped } });
}));

// All routes below require auth
router.use(protect);

// POST /api/v1/reviews  — create (starts as pending)
router.post('/', asyncHandler(async (req, res) => {
  const { restaurantId, rating, comment } = req.body;
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) return res.status(404).json({ success: false, error: 'Restaurant not found' });

  const existing = await Review.findOne({ userId: req.user._id, restaurantId });
  if (existing) return res.status(400).json({ success: false, error: 'You have already reviewed this restaurant' });

  const review = await Review.create({ userId: req.user._id, restaurantId, rating, comment, status: 'pending' });
  await review.populate('userId', 'name avatar');
  res.status(201).json({ success: true, data: review });
}));

// PATCH /api/v1/reviews/:id/moderate  — superadmin approves/rejects
router.patch('/:id/moderate', restrictTo('super_admin'), asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status' });
  }
  const review = await Review.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!review) return res.status(404).json({ success: false, error: 'Review not found' });
  // Trigger rating recalc
  await review.save();
  res.json({ success: true, data: review });
}));

// DELETE /api/v1/reviews/:id
router.delete('/:id', asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id).populate('restaurantId');
  if (!review) return res.status(404).json({ success: false, error: 'Review not found' });
  if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
    if (!review.restaurantId?.ownerId || review.restaurantId.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'No permission' });
    }
  }
  await review.deleteOne();
  res.json({ success: true, data: {} });
}));

export default router;
