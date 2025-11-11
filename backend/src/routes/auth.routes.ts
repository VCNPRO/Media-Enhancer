import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { getUserByClerkId, getUserSubscription, getOrCreateUser } from '../services/user.service';
import { clerkClient } from '@clerk/express';

const router = Router();

// Get current user info
router.get('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const clerkUserId = req.auth?.userId;

    if (!clerkUserId) {
      return res.status(401).json({
        success: false,
        error: { message: 'Unauthorized' },
      });
    }

    // Get user from database
    let user = await getUserByClerkId(clerkUserId);

    // If user doesn't exist in DB, create it from Clerk data
    if (!user) {
      const clerkUser = await clerkClient.users.getUser(clerkUserId);
      const email = clerkUser.emailAddresses[0]?.emailAddress;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: { message: 'User email not found' },
        });
      }

      user = await getOrCreateUser(
        clerkUserId,
        email,
        clerkUser.username || undefined,
        clerkUser.imageUrl || undefined
      );
    }

    // Get subscription
    const subscription = await getUserSubscription(user.id);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          clerkUserId: user.clerk_user_id,
          email: user.email,
          username: user.username,
          avatarUrl: user.avatar_url,
          createdAt: user.created_at,
        },
        subscription: subscription ? {
          planId: subscription.plan_id,
          status: subscription.status,
        } : null,
      },
    });
  } catch (error) {
    console.error('Error getting user info:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get user info' },
    });
  }
});

// Verify authentication status
router.get('/verify', requireAuth, (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      authenticated: true,
      userId: req.auth?.userId,
    },
  });
});

export default router;
