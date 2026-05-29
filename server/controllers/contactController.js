import { sendContactEmail } from '../utils/sendEmail.js';
import asyncHandler from 'express-async-handler';

// @desc    Handle contact form submission
// @route   POST /api/v1/contact
// @access  Public
export const submitContactForm = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Validate required fields
  if (!name || !email || !subject || !message) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Validate email format
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    res.status(400);
    throw new Error('Please provide a valid email address');
  }

  // Send email
  try {
    await sendContactEmail({ name, email, subject, message });
    
    res.status(200).json({
      success: true,
      message: 'Message sent successfully. We\'ll be in touch soon!',
    });
  } catch (error) {
    console.error('Contact form email error:', error);
    res.status(500);
    throw new Error('Failed to send message. Please try again later.');
  }
});