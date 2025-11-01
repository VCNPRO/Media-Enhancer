import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { getUserByClerkId, updateUser, getUserUsageStats, getUserSubscription } from '../services/user.service';
import { query } from '../services/database.service';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Get user profile
router.get('/profile', async (req: Request, res: Response) => {
  try {
    const clerkUserId = req.auth?.userId;

    if (!clerkUserId) {
      return res.status(401).json({
        success: false,
        error: { message: 'Unauthorized' },
      });
    }

    const user = await getUserByClerkId(clerkUserId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' },
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          avatarUrl: user.avatar_url,
          createdAt: user.created_at,
        },
      },
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get user profile' },
    });
  }
});

// Update user profile
router.put('/profile', async (req: Request, res: Response) => {
  try {
    const clerkUserId = req.auth?.userId;
    const { username } = req.body;

    if (!clerkUserId) {
      return res.status(401).json({
        success: false,
        error: { message: 'Unauthorized' },
      });
    }

    const user = await updateUser(clerkUserId, { username });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' },
      });
    }

    res.json({
      success: true,
      data: {
        message: 'Profile updated successfully',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          avatarUrl: user.avatar_url,
        },
      },
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update profile' },
    });
  }
});

// Get user usage stats
router.get('/usage', async (req: Request, res: Response) => {
  try {
    const clerkUserId = req.auth?.userId;

    if (!clerkUserId) {
      return res.status(401).json({
        success: false,
        error: { message: 'Unauthorized' },
      });
    }

    const user = await getUserByClerkId(clerkUserId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' },
      });
    }

    // Get subscription to determine limits
    const subscription = await getUserSubscription(user.id);
    const planResult = await query(
      'SELECT features FROM subscription_plans WHERE id = $1',
      [subscription?.plan_id || 'starter']
    );

    const features = planResult.rows[0]?.features || {};
    const stats = await getUserUsageStats(user.id);

    // Parse storage limit
    const storageLimit = features.storage
      ? parseInt(features.storage.replace('GB', '')) * 1024 * 1024 * 1024
      : 5 * 1024 * 1024 * 1024; // Default 5GB

    res.json({
      success: true,
      data: {
        storage: {
          used: stats.storage_used,
          limit: storageLimit,
          percentage: Math.round((stats.storage_used / storageLimit) * 100),
        },
        projects: {
          count: stats.projects_count,
          limit: features.projects === 'unlimited' ? null : (features.projects || 10),
        },
        exports: {
          thisMonth: stats.exports_this_month,
          limit: features.exports === 'unlimited' ? null : (features.exports || 50),
        },
      },
    });
  } catch (error) {
    console.error('Error getting usage stats:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get usage stats' },
    });
  }
});

export default router;
