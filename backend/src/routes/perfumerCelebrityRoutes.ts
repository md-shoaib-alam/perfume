import { Router, Request, Response } from 'express';
import { Perfumer } from '../models/Perfumer';
import { Celebrity } from '../models/Celebrity';
import { requireAdmin } from '../middleware/auth';
import { SEED_CELEBRITIES } from '../config/seed';

const router = Router();

// CELEBRITIES: GET
router.get('/celebrities', async (req: Request, res: Response) => {
  try {
    let celebs = await Celebrity.find().sort({ order: 1 });
    if (!celebs || celebs.length === 0) celebs = SEED_CELEBRITIES as any;
    res.json({ success: true, data: celebs });
  } catch (error) {
    res.json({ success: true, data: SEED_CELEBRITIES });
  }
});

// CELEBRITIES: PUT Update (Admin Protected)
router.put('/celebrities/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const updated = await Celebrity.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PERFUMERS: GET
router.get('/perfumers', async (req: Request, res: Response) => {
  try {
    const perfumers = await Perfumer.find();
    res.json({ success: true, data: perfumers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch perfumers' });
  }
});

export default router;
