import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  ticketId: { type: String, unique: true },
  userName: String,
  userEmail: String,
  subject: { type: String, required: true },
  message: String,
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

ticketSchema.pre('save', function (next) {
  if (!this.ticketId) {
    this.ticketId = '#TKT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

export default mongoose.model('SupportTicket', ticketSchema);
