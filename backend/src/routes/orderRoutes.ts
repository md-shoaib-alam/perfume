import { Router, Request, Response } from 'express';
import { Order } from '../models/Order';
import { requireAdmin } from '../middleware/auth';

const router = Router();

// GET all orders (Admin Protected)
router.get('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;
    const filter: any = {};

    if (status && status !== 'all') {
      filter.orderStatus = status;
    }
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
});

// POST create new order from storefront checkout
router.post('/', async (req: Request, res: Response) => {
  try {
    const orderData = req.body;
    if (!orderData.orderNumber) {
      const rand = Math.floor(1000 + Math.random() * 9000);
      orderData.orderNumber = `NSH-${rand}`;
    }

    const newOrder = await Order.create(orderData);
    res.status(201).json({ success: true, data: newOrder });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to place order' });
  }
});

// PATCH update order status (Admin Protected)
router.patch('/:id/status', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { orderStatus } = req.body;
    const updated = await Order.findOneAndUpdate(
      { $or: [{ _id: req.params.id }, { orderNumber: req.params.id }] },
      { $set: { orderStatus } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
});

export default router;
