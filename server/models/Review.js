import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Restaurant ID is required'],
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
  },
  comment: {
    type: String,
    required: [true, 'Comment is required'],
    minlength: [10, 'Comment must be at least 10 characters'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters'],
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure one review per user per restaurant
reviewSchema.index({ userId: 1, restaurantId: 1 }, { unique: true });

// Update restaurant rating when a review is saved
reviewSchema.post('save', async function() {
  const Restaurant = mongoose.model('Restaurant');
  const stats = await this.constructor.aggregate([
    { $match: { restaurantId: this.restaurantId, status: 'approved' } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  
  if (stats.length > 0) {
    await Restaurant.findByIdAndUpdate(this.restaurantId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].count,
    });
  }
});

// Update restaurant rating when a review is deleted
reviewSchema.post('deleteOne', { document: true, query: false }, async function() {
  const Restaurant = mongoose.model('Restaurant');
  const stats = await this.constructor.aggregate([
    { $match: { restaurantId: this.restaurantId, status: 'approved' } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  
  if (stats.length > 0) {
    await Restaurant.findByIdAndUpdate(this.restaurantId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].count,
    });
  } else {
    await Restaurant.findByIdAndUpdate(this.restaurantId, {
      rating: 0,
      reviewCount: 0,
    });
  }
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;