import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { connectDB } from './config/db';
import { clerkAuthMiddleware } from './middleware/auth';

import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import collectionRoutes from './routes/collectionRoutes';
import perfumerCelebrityRoutes from './routes/perfumerCelebrityRoutes';
import reviewRoutes from './routes/reviewRoutes';
import settingsRoutes from './routes/settingsRoutes';
import statsRoutes from './routes/statsRoutes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Global Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Mount Clerk Auth Middleware (optional per request inspection)
app.use(clerkAuthMiddleware);

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api', perfumerCelebrityRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admin/stats', statsRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Neesh Perfumes Backend API (MongoDB + Clerk)'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`  NEESH PERFUMES BACKEND SERVER READY  `);
  console.log(`  Port: ${PORT}                        `);
  console.log(`  Health: http://localhost:${PORT}/api/health`);
  console.log(`========================================`);
});

export default app;
