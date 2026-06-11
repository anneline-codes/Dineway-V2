import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import Restaurant from '../models/Restaurant.js';
import Hotel from '../models/Hotel.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Reservation from '../models/Reservation.js';

const router = express.Router();

// GET /api/v1/dashboard/admin  — restaurant admin dashboard
router.get('/admin', protect, async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const filter = restaurantId ? { restaurant: restaurantId } : {};

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [allOrders, todayOrders, allBookings, todayBookings, restaurant] = await Promise.all([
      Order.find(filter).sort({ orderTime: -1 }).limit(10).populate('customer', 'name'),
      Order.countDocuments({ ...filter, orderTime: { $gte: today, $lt: tomorrow } }),
      restaurantId ? Reservation.countDocuments({ restaurantId }) : Promise.resolve(0),
      restaurantId ? Reservation.countDocuments({ restaurantId, date: { $gte: today, $lt: tomorrow } }) : Promise.resolve(0),
      restaurantId ? Restaurant.findById(restaurantId) : Promise.resolve(null),
    ]);

    const todayRevenue = (await Order.find({ ...filter, orderTime: { $gte: today, $lt: tomorrow } }))
      .reduce((s, o) => s + (o.totalPrice || 0), 0);

    const recentOrders = allOrders.map(o => ({
      _id: o._id,
      orderId: o.orderId,
      clientId: o.customer,
      totalAmount: o.totalPrice,
      status: o.status,
    }));

    res.json({ success: true, data: { todayOrders, todayRevenue, todayBookings, totalBookings: allBookings, restaurant, recentOrders } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/dashboard/overview  — also alias for admin (legacy)
router.get('/overview', protect, async (req, res) => {
  try {
    const orders = await Order.find().sort({ orderTime: -1 });
    const now = new Date();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now - 14 * 24 * 60 * 60 * 1000);

    const thisWeekOrders = orders.filter(o => new Date(o.orderTime) >= weekAgo);
    const lastWeekOrders = orders.filter(o => new Date(o.orderTime) >= twoWeeksAgo && new Date(o.orderTime) < weekAgo);

    const totalOrders = {
      value: orders.length,
      wowChange: lastWeekOrders.length ? Math.round(((thisWeekOrders.length - lastWeekOrders.length) / lastWeekOrders.length) * 100) : 0,
    };
    const totalRevenue = { value: orders.reduce((s, o) => s + (o.totalPrice || 0), 0), wowChange: 0 };
    const drinksOrders = { value: orders.filter(o => o.category === 'Drinks').length, wowChange: 0 };
    const foodOrders = { value: orders.filter(o => o.category === 'Food').length, wowChange: 0 };

    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayOrders = orders.filter(o => new Date(o.orderTime).toDateString() === d.toDateString());
      chartData.push({
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        orders: dayOrders.length,
        drinks: dayOrders.filter(o => o.category === 'Drinks').length,
        foods: dayOrders.filter(o => o.category === 'Food').length,
      });
    }

    res.json({ success: true, data: { metrics: { totalOrders, totalRevenue, drinksOrders, foodOrders }, chartData } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/dashboard/superadmin  — superadmin full dashboard (matches superadmin UI)
router.get('/superadmin', protect, restrictTo('super_admin'), async (req, res) => {
  try {
    const now = new Date();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now - 14 * 24 * 60 * 60 * 1000);

    const [totalRestaurants, totalHotels, totalUsers, orders, lastWeekRestaurants, lastWeekHotels, lastWeekUsers, restaurants, hotels] = await Promise.all([
      Restaurant.countDocuments(),
      Hotel.countDocuments(),
      User.countDocuments(),
      Order.find().sort({ orderTime: -1 }).populate('customer', 'name').populate('restaurant', 'name'),
      Restaurant.countDocuments({ createdAt: { $gte: weekAgo } }),
      Hotel.countDocuments({ createdAt: { $gte: weekAgo } }),
      User.countDocuments({ createdAt: { $gte: weekAgo } }),
      Restaurant.find().sort({ rating: -1 }).limit(5).select('name rating'),
      Hotel.find().sort({ rating: -1 }).limit(5).select('name rating'),
    ]);

    const thisWeekOrders = orders.filter(o => new Date(o.orderTime) >= weekAgo);
    const prevWeekOrders = orders.filter(o => new Date(o.orderTime) >= twoWeeksAgo && new Date(o.orderTime) < weekAgo);
    const totalRevenue = orders.reduce((s, o) => s + (o.totalPrice || 0), 0);
    const prevRevenue = prevWeekOrders.reduce((s, o) => s + (o.totalPrice || 0), 0);
    const thisRevenue = thisWeekOrders.reduce((s, o) => s + (o.totalPrice || 0), 0);

    // Revenue chart (last 7 days)
    const revenueChart = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayOrders = orders.filter(o => new Date(o.orderTime).toDateString() === d.toDateString());
      revenueChart.push({
        _id: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: dayOrders.reduce((s, o) => s + (o.totalPrice || 0), 0),
        orders: dayOrders.length,
      });
    }

    // Top venues (restaurants + hotels combined)
    const topVenues = [
      ...restaurants.map(r => ({ _id: r._id, name: r.name, type: 'restaurant', rating: r.rating })),
      ...hotels.map(h => ({ _id: h._id, name: h.name, type: 'hotel', rating: h.rating })),
    ].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5);

    // Recent orders mapped to superadmin UI shape
    const recentOrders = orders.slice(0, 8).map(o => ({
      _id: o._id,
      orderId: o.orderId,
      clientId: o.customer,
      restaurantId: o.restaurant,
      totalAmount: o.totalPrice,
      status: o.status,
    }));

    const pct = (cur, prev) => prev ? Math.round(((cur - prev) / prev) * 100) : 0;

    res.json({
      success: true,
      data: {
        kpis: {
          totalRestaurants: { value: totalRestaurants, change: pct(lastWeekRestaurants, totalRestaurants - lastWeekRestaurants) },
          totalHotels: { value: totalHotels, change: pct(lastWeekHotels, totalHotels - lastWeekHotels) },
          totalUsers: { value: totalUsers, change: pct(lastWeekUsers, totalUsers - lastWeekUsers) },
          totalOrders: { value: orders.length, change: pct(thisWeekOrders.length, prevWeekOrders.length) },
          totalRevenue: { value: totalRevenue, change: pct(thisRevenue, prevRevenue) },
        },
        revenueChart,
        topVenues,
        recentOrders,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
