import { Router, Request, Response } from 'express';
import { Collection } from '../models/Collection';
import { requireAdmin } from '../middleware/auth';
import { SEED_COLLECTIONS } from '../config/seed';

const router = Router();

// GET all collections
router.get('/', async (req: Request, res: Response) => {
  try {
    let collections = await Collection.find().sort({ order: 1 });
    if (!collections || collections.length === 0) {
      collections = SEED_COLLECTIONS as any;
    }
    res.json({ success: true, count: collections.length, data: collections });
  } catch (error) {
    res.json({ success: true, count: SEED_COLLECTIONS.length, data: SEED_COLLECTIONS });
  }
});

// POST add collection (Admin Protected)
router.post('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    const created = await Collection.create(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT update collection (Admin Protected)
router.put('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const updated = await Collection.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE collection (Admin Protected)
router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    await Collection.findOneAndDelete({ id: req.params.id });
    res.json({ success: true, message: 'Collection deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete' });
  }
});

export default router;
