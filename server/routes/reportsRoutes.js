import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import Order from '../models/Order.js';
import Restaurant from '../models/Restaurant.js';
import Hotel from '../models/Hotel.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/', protect, restrictTo('super_admin'), async (req, res) => {
  try {
    const [totalOrders, totalRestaurants, totalHotels, totalUsers, orders] = await Promise.all([
      Order.countDocuments(),
      Restaurant.countDocuments(),
      Hotel.countDocuments(),
      User.countDocuments(),
      Order.find().sort({ orderTime: 1 }),
    ]);

    const totalRevenue = orders.reduce((s, o) => s + (o.totalPrice || 0), 0);

    const revenueMap = {};
    orders.forEach(o => {
      const day = new Date(o.orderTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      revenueMap[day] = (revenueMap[day] || 0) + (o.totalPrice || 0);
    });

    const catAgg = await Order.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);

    res.json({
      success: true,
      data: {
        summary: { totalOrders, totalRestaurants, totalHotels, totalUsers, totalRevenue },
        revenueChart: Object.entries(revenueMap).map(([date, revenue]) => ({ date, revenue })),
        ordersByCategory: catAgg.map(c => ({ category: c._id, count: c.count })),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
