import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  siteName: { type: String, default: 'Dineway Global' },
  siteEmail: { type: String, default: '' },
  sitePhone: { type: String, default: '' },
  siteAddress: { type: String, default: '' },
  timezone: { type: String, default: '(UTC+00:00) UTC' },
  currency: { type: String, default: 'USD - US Dollar' },
  maintenanceMode: { type: Boolean, default: false },
  emailNotifications: { type: Boolean, default: true },
  smsNotifications: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Settings', settingsSchema);
