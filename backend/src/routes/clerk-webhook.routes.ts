import { Router, Request, Response } from 'express';
import { Webhook } from 'svix';
import { createUser, updateUser, deleteUser, getOrCreateUser } from '../services/user.service';

const router = Router();

// Clerk webhook endpoint
router.post('/clerk', async (req: Request, res: Response) => {
  try {
    // Get the headers
    const svix_id = req.headers['svix-id'] as string;
    const svix_timestamp = req.headers['svix-timestamp'] as string;
    const svix_signature = req.headers['svix-signature'] as string;

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return res.status(400).json({
        success: false,
        error: { message: 'Missing svix headers' },
      });
    }

    // Get the body
    const payload = req.body;
    const body = JSON.stringify(payload);

    // Create a new Svix instance with your webhook secret
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('CLERK_WEBHOOK_SECRET not configured');
      return res.status(500).json({
        success: false,
        error: { message: 'Webhook secret not configured' },
      });
    }

    const wh = new Webhook(webhookSecret);

    let evt: any;

    // Verify the webhook
    try {
      evt = wh.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      });
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid signature' },
      });
    }

    // Handle the webhook
    const eventType = evt.type;
    console.log(`Received Clerk webhook: ${eventType}`);

    switch (eventType) {
      case 'user.created': {
        const { id, email_addresses, username, image_url } = evt.data;
        const email = email_addresses[0]?.email_address;

        if (!email) {
          console.error('User created without email');
          break;
        }

        await getOrCreateUser(id, email, username, image_url);
        console.log(`✅ User created in database: ${email}`);
        break;
      }

      case 'user.updated': {
        const { id, email_addresses, username, image_url } = evt.data;
        const email = email_addresses[0]?.email_address;

        await updateUser(id, {
          email,
          username,
          avatar_url: image_url,
        });
        console.log(`✅ User updated in database: ${id}`);
        break;
      }

      case 'user.deleted': {
        const { id } = evt.data;

        if (id) {
          await deleteUser(id);
          console.log(`✅ User deleted from database: ${id}`);
        }
        break;
      }

      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Clerk webhook error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Webhook processing failed' },
    });
  }
});

export default router;
