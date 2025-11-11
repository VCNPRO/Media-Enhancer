import { Request, Response, NextFunction } from 'express';
import { clerkMiddleware, requireAuth as clerkRequireAuth } from '@clerk/express';
import { ApiError } from './error.middleware';

// Extend Express Request to include auth
declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        sessionId: string;
      };
    }
  }
}

// Clerk authentication middleware
export const requireAuth = clerkRequireAuth();

// Check if user has a specific subscription tier
export const requireSubscription = (minTier: 'starter' | 'creator' | 'professional') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.auth?.userId) {
        throw new ApiError('Unauthorized', 401);
      }

      // TODO: Implement subscription tier check from database
      // For now, allow all authenticated users
      next();
    } catch (error) {
      next(error);
    }
  };
};
