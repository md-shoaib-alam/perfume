import { Router, Request, Response } from 'express';
import { Product } from '../models/Product';
import { requireAdmin } from '../middleware/auth';
import { SEED_PRODUCTS } from '../config/seed';

const router = Router();

// GET all products with filtering & search
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, search, bestseller } = req.query;
    const filter: any = {};

    if (category && category !== 'all') {
      filter.category = category;
    }
    if (bestseller === 'true') {
      filter.isBestseller = true;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { subtitle: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    let products = await Product.find(filter).sort({ createdAt: -1 });

    // Fallback if MongoDB is not connected
    if (!products || products.length === 0) {
      products = SEED_PRODUCTS as any;
    }

    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.json({ success: true, count: SEED_PRODUCTS.length, data: SEED_PRODUCTS });
  }
});

// GET single product by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) {
      const fallback = SEED_PRODUCTS.find((p) => p.id === req.params.id);
      if (fallback) return res.json({ success: true, data: fallback });
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST create new product (Admin Protected)
router.post('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    const newProductData = req.body;
    if (!newProductData.id) {
      newProductData.id = newProductData.name.toLowerCase().replace(/\s+/g, '-');
    }

    const created = await Product.create(newProductData);
    res.status(201).json({ success: true, data: created });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to create product' });
  }
});

// PUT update product (Admin Protected)
router.put('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const updated = await Product.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to update product' });
  }
});

// DELETE remove product (Admin Protected)
router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    await Product.findOneAndDelete({ id: req.params.id });
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
});

export default router;
