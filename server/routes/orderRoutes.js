import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import Order from '../models/Order.js';
import { io } from '../index.js';

const router = express.Router();

// GET /api/v1/orders  — superadmin gets all orders
router.get('/', protect, restrictTo('super_admin'), async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) filter.orderId = { $regex: search, $options: 'i' };

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .sort({ orderTime: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('customer', 'name')
      .populate('restaurant', 'name');

    // Map for superadmin UI
    const mapped = orders.map(o => ({
      _id: o._id,
      orderId: o.orderId,
      clientId: o.customer,
      restaurantId: o.restaurant,
      totalAmount: o.totalPrice,
      status: o.status,
      createdAt: o.orderTime,
      items: o.items,
    }));

    res.json({ success: true, data: { orders: mapped, total } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/orders/restaurant  — restaurant admin gets their orders
router.get('/restaurant', protect, async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const filter = restaurantId ? { restaurant: restaurantId } : {};
    const orders = await Order.find(filter)
      .sort({ orderTime: -1 })
      .populate('customer', 'name');

    const mapped = orders.map(o => ({
      _id: o._id,
      orderId: o.orderId,
      clientId: o.customer,
      items: o.items,
      totalAmount: o.totalPrice,
      status: o.status,
      createdAt: o.orderTime,
    }));

    res.json({ success: true, data: { orders: mapped } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/orders/my  — customer's own orders
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .sort({ orderTime: -1 })
      .populate('restaurant', 'name');
    res.json({ success: true, data: { orders } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/orders/:id  — single order by mongo _id
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name')
      .populate('restaurant', 'name');
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/v1/orders/:id/status  — update order status, emit socket event
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).populate('restaurant', 'name');

    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    // Notify restaurant room and superadmin
    if (order.restaurant) {
      io.to(`restaurant:${order.restaurant._id}`).emit('order:updated', { order });
    }
    io.to('superadmin').emit('order:updated', { order });

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/v1/orders  — create order, emit socket event to restaurant + superadmin
router.post('/', protect, async (req, res) => {
  try {
    const order = await Order.create({
      ...req.body,
      customer: req.user._id,
      customerName: req.user.name,
    });

    await order.populate('restaurant', 'name');
    await order.populate('customer', 'name');

    const payload = {
      _id: order._id,
      orderId: order.orderId,
      clientId: order.customer,
      restaurantId: order.restaurant,
      totalAmount: order.totalPrice,
      status: order.status,
      items: order.items,
      createdAt: order.orderTime,
    };

    // Real-time: notify the restaurant admin
    if (order.restaurant) {
      io.to(`restaurant:${order.restaurant._id}`).emit('order:new', { order: payload });
    }
    // Real-time: notify superadmin
    io.to('superadmin').emit('order:new', { order: payload });

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
