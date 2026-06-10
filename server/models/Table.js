import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Restaurant ID is required'],
  },
  tableNumber: {
    type: String,
    required: [true, 'Table number is required'],
    trim: true,
  },
  capacity: {
    type: Number,
    required: [true, 'Table capacity is required'],
    min: [1, 'Capacity must be at least 1'],
    max: [50, 'Capacity cannot exceed 50'],
  },
  section: {
    type: String,
    default: 'Main Hall',
    trim: true,
  },
  shape: {
    type: String,
    enum: ['square', 'circle'],
    default: 'square',
  },
  status: {
    type: String,
    enum: ['available', 'reserved', 'occupied'],
    default: 'available',
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure table numbers are unique per restaurant
tableSchema.index({ restaurantId: 1, tableNumber: 1 }, { unique: true });

const Table = mongoose.model('Table', tableSchema);

export default Table;
