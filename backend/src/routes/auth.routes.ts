import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Get current user info
router.get('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { message: 'Unauthorized' },
      });
    }

    // TODO: Fetch user data from database
    res.json({
      success: true,
      data: {
        userId,
        // Add more user data here
      },
    });
  } catch (error) {
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
