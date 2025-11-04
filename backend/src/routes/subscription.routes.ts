import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { body } from 'express-validator';
import { validate } from '../middleware/validation.middleware';
import { checkoutRateLimiter } from '../middleware/rateLimit.middleware';
import Stripe from 'stripe';

const router = Router();

// Initialize Stripe only if API key is provided
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Stripe API key not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-11-20.acacia',
  });
};

// All routes require authentication
router.use(requireAuth);

// Almacenamiento temporal de tiers (en memoria)
// TODO: Reemplazar con base de datos en producción
const userTiers = new Map<string, string>();

// Get user subscription status (used by frontend)
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { message: 'Unauthorized' },
      });
    }

    // Obtener tier del almacenamiento temporal o usar 'starter' por defecto
    const tier = userTiers.get(userId) || 'starter';

    res.json({
      success: true,
      data: {
        tier: tier,
        status: 'active',
        userId: userId,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get subscription' },
    });
  }
});

// Set user tier (temporal para testing)
router.post(
  '/set-tier',
  validate([
    body('tier')
      .isIn(['starter', 'creator', 'professional'])
      .withMessage('Invalid tier. Must be starter, creator, or professional'),
  ]),
  async (req: Request, res: Response) => {
    try {
      const userId = req.auth?.userId;
      const { tier } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized' },
        });
      }

      // Guardar tier en memoria
      userTiers.set(userId, tier);

      res.json({
        success: true,
        data: {
          tier: tier,
          message: 'Tier actualizado exitosamente',
        },
      });
    } catch (error) {
      console.error('Set tier error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to set tier' },
      });
    }
  }
);

// Get available plans
router.get('/plans', async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        plans: [
          {
            id: 'starter',
            name: 'Starter',
            price: 0,
            interval: 'month',
            features: {
              storage: '5GB',
              projects: 10,
              exports: 50,
              maxDuration: 300, // 5 minutes
              aiEnhancements: false,
              watermark: true,
            },
          },
          {
            id: 'creator',
            name: 'Creator',
            price: 1499, // $14.99
            interval: 'month',
            features: {
              storage: '50GB',
              projects: 100,
              exports: 500,
              maxDuration: 1800, // 30 minutes
              aiEnhancements: true,
              watermark: false,
            },
          },
          {
            id: 'professional',
            name: 'Professional',
            price: 4999, // $49.99
            interval: 'month',
            features: {
              storage: '500GB',
              projects: 'unlimited',
              exports: 'unlimited',
              maxDuration: 7200, // 2 hours
              aiEnhancements: true,
              watermark: false,
              prioritySupport: true,
            },
          },
        ],
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get plans' },
    });
  }
});

// Get current subscription
router.get('/current', async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId;

    // TODO: Fetch subscription from database
    res.json({
      success: true,
      data: {
        plan: 'starter',
        status: 'active',
        // Add subscription data here
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get subscription' },
    });
  }
});

// Create checkout session
router.post(
  '/checkout',
  checkoutRateLimiter,
  validate([
    body('planId')
      .notEmpty()
      .withMessage('Plan ID is required')
      .isString()
      .withMessage('Plan ID must be a string'),
  ]),
  async (req: Request, res: Response) => {
    try {
      const userId = req.auth?.userId;
      const { planId } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized' },
        });
      }

      // TODO: Create Stripe checkout session
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [
          {
            price: planId, // This should be a Stripe Price ID
            quantity: 1,
          },
        ],
        success_url: `${process.env.FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/pricing`,
        metadata: {
          userId,
        },
      });

      res.json({
        success: true,
        data: {
          sessionId: session.id,
          url: session.url,
        },
      });
    } catch (error) {
      console.error('Checkout error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to create checkout session' },
      });
    }
  }
);

// Cancel subscription
router.post('/cancel', async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId;

    // TODO: Cancel subscription in Stripe and database
    res.json({
      success: true,
      data: {
        message: 'Subscription cancelled successfully',
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to cancel subscription' },
    });
  }
});

export default router;
