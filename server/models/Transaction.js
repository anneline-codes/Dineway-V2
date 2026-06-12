import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  transactionId: { type: String, unique: true },
  type: { type: String, enum: ['payment', 'refund', 'payout'], default: 'payment' },
  description: String,
  amount: { type: Number, required: true },
  venue: String,
  status: { type: String, enum: ['completed', 'pending', 'failed', 'refunded'], default: 'completed' },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

transactionSchema.pre('save', function (next) {
  if (!this.transactionId) {
    this.transactionId = '#TXN-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

export default mongoose.model('Transaction', transactionSchema);
