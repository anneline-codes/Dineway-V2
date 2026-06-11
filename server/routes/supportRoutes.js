import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import SupportTicket from '../models/SupportTicket.js';

const router = express.Router();

router.get('/', protect, restrictTo('super_admin'), async (req, res) => {
  try {
    const { status, priority, search, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) filter.$or = [{ ticketId: { $regex: search, $options: 'i' } }, { subject: { $regex: search, $options: 'i' } }, { userName: { $regex: search, $options: 'i' } }];

    const total = await SupportTicket.countDocuments(filter);
    const tickets = await SupportTicket.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
    res.json({ success: true, data: { tickets, total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/:id', protect, restrictTo('super_admin'), async (req, res) => {
  try {
    const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: ticket });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
