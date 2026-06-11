import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import Settings from '../models/Settings.js';

const router = express.Router();

router.get('/', protect, restrictTo('super_admin'), async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/', protect, restrictTo('super_admin'), async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create(req.body);
    else { Object.assign(settings, req.body); await settings.save(); }
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
