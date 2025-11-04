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
    console.error('Webhook Error: Missing Stripe signature');
    return res.status(400).json({
      success: false,
      error: {
        message: 'Missing stripe signature',
        code: 'MISSING_SIGNATURE'
      },
    });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('Webhook Error: STRIPE_WEBHOOK_SECRET not configured');
    return res.status(500).json({
      success: false,
      error: {
        message: 'Webhook secret not configured',
        code: 'CONFIG_ERROR'
      },
    });
  }

  try {
    const stripe = getStripe();

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log(`✓ Webhook verified: ${event.type} - ${event.id}`);

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
  } catch (error: any) {
    console.error('Webhook error:', error);

    // Distinguir entre errores de verificación de firma y otros errores
    if (error.type === 'StripeSignatureVerificationError') {
      console.error('⚠ Invalid webhook signature');
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid signature',
          code: 'INVALID_SIGNATURE',
        },
      });
    }

    // Log el error pero devolver 200 para evitar reintentos de Stripe
    // si el problema es interno
    console.error('Internal webhook processing error:', error.message);
    res.status(500).json({
      success: false,
      error: {
        message: 'Webhook processing failed',
        code: 'PROCESSING_ERROR',
      },
    });
  }
});

export default router;
