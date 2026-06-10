import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
  },
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
  tableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: [true, 'Table ID is required'],
  },
  date: {
    type: Date,
    required: [true, 'Reservation date is required'],
  },
  timeSlot: {
    type: String,
    required: [true, 'Time slot is required'],
  },
  startTime: {
    type: String,
    default: '',
  },
  endTime: {
    type: String,
    default: '',
  },
  guestCount: {
    type: Number,
    required: [true, 'Guest count is required'],
    min: [1, 'Guest count must be at least 1'],
    max: [50, 'Guest count cannot exceed 50'],
  },
  // Guest contact details (may differ from user account)
  guestName: {
    type: String,
    default: '',
    trim: true,
  },
  guestPhone: {
    type: String,
    default: '',
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'confirmed',
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient queries
reservationSchema.index({ userId: 1, createdAt: -1 });
reservationSchema.index({ restaurantId: 1, date: 1, timeSlot: 1 });
reservationSchema.index({ tableId: 1, date: 1, timeSlot: 1 });

// Auto-generate bookingId before saving
reservationSchema.pre('save', async function (next) {
  if (!this.bookingId) {
    const rand = Math.floor(10000 + Math.random() * 90000);
    this.bookingId = `DW${rand}`;
  }
  next();
});

// Check for conflicting reservations
reservationSchema.statics.checkAvailability = async function (restaurantId, date, timeSlot, tableId) {
  const conflictingReservation = await this.findOne({
    restaurantId,
    date: new Date(date),
    timeSlot,
    tableId,
    status: { $in: ['pending', 'confirmed'] },
  });
  return !conflictingReservation;
};

const Reservation = mongoose.model('Reservation', reservationSchema);

export default Reservation;
