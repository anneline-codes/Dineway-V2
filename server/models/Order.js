import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerName: String,
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
  restaurantName: String,
  items: [{ name: String, qty: Number, price: Number }],
  category: { type: String, enum: ['Food', 'Drinks', 'Room Service', 'Other'], default: 'Food' },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Preparing', 'Completed', 'Cancelled'], default: 'Pending' },
  paymentStatus: { type: String, enum: ['paid', 'unpaid', 'refunded'], default: 'unpaid' },
  orderTime: { type: Date, default: Date.now },
}, { timestamps: true });

orderSchema.pre('save', function (next) {
  if (!this.orderId) {
    this.orderId = '#ORD-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

export default mongoose.model('Order', orderSchema);
