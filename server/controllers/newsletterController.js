import Newsletter from '../models/Newsletter.js';
import asyncHandler from 'express-async-handler';

// @desc    Subscribe to newsletter
// @route   POST /api/v1/newsletter/subscribe
// @access  Public
export const subscribe = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      error: 'Please provide an email address',
    });
  }

  // Check if email already subscribed
  const existing = await Newsletter.findOne({ email });
  if (existing) {
    return res.status(400).json({
      success: false,
      error: 'This email is already subscribed to our newsletter',
    });
  }

  // Create subscription
  await Newsletter.create({ email });

  res.status(201).json({
    success: true,
    message: 'Successfully subscribed to our newsletter!',
  });
});