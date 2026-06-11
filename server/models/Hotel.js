import mongoose from 'mongoose';

const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  managerEmail: String,
  location: String,
  city: String,
  country: String,
  status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'active' },
  rating: { type: Number, default: 0 },
  totalBookings: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 },
  phone: String,
  stars: { type: Number, default: 3 },
  joinedOn: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('Hotel', hotelSchema);
