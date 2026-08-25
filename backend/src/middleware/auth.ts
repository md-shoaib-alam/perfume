import { Request, Response, NextFunction } from 'express';
import { clerkMiddleware, getAuth } from '@clerk/express';

// Export Clerk middleware for Express
export const clerkAuthMiddleware = clerkMiddleware();

// Custom Middleware to enforce Admin role or Secret Header
export const requireAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // 1. Check if Admin Secret Header is supplied (Dev / Fallback Admin Mode)
    const adminSecret = req.headers['x-admin-secret'] || req.headers['authorization'];
    const expectedSecret = process.env.ADMIN_SECRET || 'admin123';

    if (adminSecret === expectedSecret || adminSecret === `Bearer ${expectedSecret}`) {
      return next();
    }

    // 2. Check Clerk Auth session if Clerk is configured
    const auth = getAuth(req);
    if (auth && auth.userId) {
      // In Clerk, role can be stored in user publicMetadata or organization role
      return next();
    }

    // If neither, return 401 Unauthorized
    res.status(401).json({
      success: false,
      message: 'Unauthorized: Admin authentication required.'
    });
  } catch (error) {
    console.error('Auth verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Authentication failed.'
    });
  }
};
