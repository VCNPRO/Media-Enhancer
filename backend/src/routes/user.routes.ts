import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Get user profile
router.get('/profile', async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId;

    // TODO: Fetch user profile from database
    res.json({
      success: true,
      data: {
        userId,
        // Add profile data here
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get user profile' },
    });
  }
});

// Update user profile
router.put('/profile', async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId;
    const updates = req.body;

    // TODO: Update user profile in database
    res.json({
      success: true,
      data: {
        message: 'Profile updated successfully',
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update profile' },
    });
  }
});

// Get user usage stats
router.get('/usage', async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId;

    // TODO: Fetch usage stats from database
    res.json({
      success: true,
      data: {
        storage: {
          used: 0,
          limit: 5368709120, // 5GB
        },
        projects: {
          count: 0,
          limit: 10,
        },
        exports: {
          thisMonth: 0,
          limit: 50,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get usage stats' },
    });
  }
});

export default router;
