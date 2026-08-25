import { Router, Request, Response } from 'express';
import { Review } from '../models/Review';
import { requireAdmin } from '../middleware/auth';

const router = Router();

// GET all reviews
router.get('/', async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  }
});

// POST submit review
router.post('/', async (req: Request, res: Response) => {
  try {
    const review = await Review.create(req.body);
    res.status(201).json({ success: true, data: review });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE review (Admin Protected)
router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Review removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete review' });
  }
});

export default router;
