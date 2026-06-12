import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import Transaction from '../models/Transaction.js';

const router = express.Router();

// GET /api/v1/finance  — superadmin
router.get('/', protect, restrictTo('super_admin'), async (req, res) => {
  try {
    const { type, status, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (search) filter.$or = [
      { transactionId: { $regex: search, $options: 'i' } },
      { venue: { $regex: search, $options: 'i' } },
    ];

    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const all = await Transaction.find({ status: 'completed' });
    const totalRevenue = all.reduce((s, t) => s + (t.amount || 0), 0);
    const refunds = await Transaction.find({ type: 'refund' });
    const totalRefunds = refunds.reduce((s, t) => s + (t.amount || 0), 0);
    const pending = await Transaction.find({ status: 'pending' });
    const pendingPayout = pending.reduce((s, t) => s + (t.amount || 0), 0);

    res.json({
      success: true,
      data: { transactions, total, page: Number(page), pages: Math.ceil(total / limit), summary: { totalRevenue, totalRefunds, pendingPayout } },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/finance/admin  — restaurant admin's transactions
router.get('/admin', protect, async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const filter = restaurantId ? { restaurantId } : {};
    const transactions = await Transaction.find(filter).sort({ createdAt: -1 }).limit(50);
    const total = transactions.reduce((s, t) => s + (t.amount || 0), 0);
    res.json({ success: true, data: { transactions, total } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
