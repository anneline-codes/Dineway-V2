import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import Hotel from '../models/Hotel.js';

const router = express.Router();

router.get('/', protect, restrictTo('super_admin'), async (req, res) => {
  try {
    const { status, city, country, search, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (city) filter.city = city;
    if (country) filter.country = country;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const total = await Hotel.countDocuments(filter);
    const hotels = await Hotel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
    res.json({ hotels, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, restrictTo('super_admin'), async (req, res) => {
  try {
    const hotel = await Hotel.create(req.body);
    res.status(201).json(hotel);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', protect, restrictTo('super_admin'), async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(hotel);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', protect, restrictTo('super_admin'), async (req, res) => {
  try {
    await Hotel.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
