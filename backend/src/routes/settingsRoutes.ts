import { Router, Request, Response } from 'express';
import { StoreSettings } from '../models/StoreSettings';
import { requireAdmin } from '../middleware/auth';

const router = Router();

// GET store settings
router.get('/', async (req: Request, res: Response) => {
  try {
    let settings = await StoreSettings.findOne();
    if (!settings) {
      settings = await StoreSettings.create({});
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
});

// PUT update store settings (Admin Protected)
router.put('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    let settings = await StoreSettings.findOne();
    if (!settings) {
      settings = await StoreSettings.create(req.body);
    } else {
      settings = await StoreSettings.findByIdAndUpdate(
        settings._id,
        { $set: req.body },
        { new: true }
      );
    }
    res.json({ success: true, data: settings });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
