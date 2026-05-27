import Review from '../models/Review.js';
import Restaurant from '../models/Restaurant.js';
import asyncHandler from 'express-async-handler';

// @desc    Create a new review
// @route   POST /api/v1/reviews
// @access  Private
export const createReview = asyncHandler(async (req, res) => {
  const { restaurantId, rating, comment } = req.body;

  // Check if restaurant exists
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    return res.status(404).json({
      success: false,
      error: 'Restaurant not found',
    });
  }

  // Check if user already reviewed this restaurant
  const existingReview = await Review.findOne({
    userId: req.user._id,
    restaurantId,
  });

  if (existingReview) {
    return res.status(400).json({
      success: false,
      error: 'You have already reviewed this restaurant',
    });
  }

  // Create review
  const review = await Review.create({
    userId: req.user._id,
    restaurantId,
    rating,
    comment,
  });

  // Populate user info
  await review.populate('userId', 'name avatar');

  res.status(201).json({
    success: true,
    data: review,
  });
});

// @desc    Get reviews for a restaurant
// @route   GET /api/v1/reviews/restaurant/:restaurantId
// @access  Public
export const getRestaurantReviews = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const reviews = await Review.find({ restaurantId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate('userId', 'name avatar');

  const total = await Review.countDocuments({ restaurantId });

  res.status(200).json({
    success: true,
    count: reviews.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: reviews,
  });
});

// @desc    Get latest highest-rated reviews (for homepage)
// @route   GET /api/v1/reviews/latest
// @access  Public
export const getLatestReviews = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 3;

  const reviews = await Review.find()
    .sort({ rating: -1, createdAt: -1 })
    .limit(limit)
    .populate('userId', 'name avatar')
    .populate('restaurantId', 'name slug');

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews,
  });
});

// @desc    Delete a review
// @route   DELETE /api/v1/reviews/:id
// @access  Private (Admin or Owner)
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id).populate('restaurantId');

  if (!review) {
    return res.status(404).json({
      success: false,
      error: 'Review not found',
    });
  }

  // Check if user is admin or restaurant owner
  if (req.user.role !== 'admin') {
    const restaurant = review.restaurantId;
    if (restaurant.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to delete this review',
      });
    }
  }

  await Review.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {},
    message: 'Review deleted successfully',
  });
});