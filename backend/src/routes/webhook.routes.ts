import { Router, Request, Response } from 'express';
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

// Stripe webhook endpoint
router.post('/stripe', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    return res.status(400).json({
      success: false,
      error: { message: 'Missing stripe signature' },
    });
  }

  try {
    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout completed:', session.id);
        // TODO: Update user subscription in database
        break;

      case 'customer.subscription.created':
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription created:', subscription.id);
        // TODO: Create subscription record in database
        break;

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription;
        console.log('Subscription updated:', updatedSubscription.id);
        // TODO: Update subscription in database
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        console.log('Subscription deleted:', deletedSubscription.id);
        // TODO: Mark subscription as cancelled in database
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Payment succeeded:', invoice.id);
        // TODO: Update payment status in database
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        console.log('Payment failed:', failedInvoice.id);
        // TODO: Handle failed payment
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({
      success: false,
      error: { message: 'Webhook error' },
    });
  }
});

export default router;
