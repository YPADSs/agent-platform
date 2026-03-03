import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function mapStatus(status) {
  switch (status) {
    case 'active':
      return 'ACTIVE';
    case 'past_due':
      return 'PAST_DUE';
    case 'canceled':
    case 'unpaid':
      return 'CANCELED';
    default:
      return 'INACTIVE';
  }
}

async function markProcessed(stripeEvent) {
  // Idempotency ledger: store event.id unique. If already exists => skip.
  try {
    await prisma.billingEvent.create({
      data: {
        stripeEventId: stripeEvent.id,
        type: stripeEvent.type,
        processedAt: new Date(),
      },
    });
    return true;
  } catch (e) {
    // Prisma unique violation => already processed
    if (e?.code === 'P2002') return false;
    // Unknown DB error: let Stripe retry
    throw e;
  }
}

export async function handler(event) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secretKey || !webhookSecret) {
      return { statusCode: 500, body: 'Stripe not configured' };
    }

    const stripe = new Stripe(secretKey, { apiVersion: '2024-06-20' });

    const sig = event.headers['stripe-signature'] || event.headers['Stripe-Signature'];
    if (!sig) return { statusCode: 400, body: 'Missing stripe-signature' };

    const rawBody = event.isBase64Encoded
      ? Buffer.from(event.body || '', 'base64').toString('utf8')
      : event.body || '';

    const stripeEvent = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);

    const shouldProcess = await markProcessed(stripeEvent);
    if (!shouldProcess) return { statusCode: 200, body: 'ok' };

    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        // We rely on subscription events for state sync. This is for attribution/audit only.
        return { statusCode: 200, body: 'ok' };
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = stripeEvent.data.object;
        const customerId = sub.customer;
        const user = await prisma.user.findUnique({ where: { stripeCustomerId: customerId } });
        if (!user) return { statusCode: 200, body: 'ok' };

        await prisma.subscription.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            stripeSubscriptionId: sub.id,
            status: mapStatus(sub.status),
            currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : null,
          },
          update: {
            stripeSubscriptionId: sub.id,
            status: mapStatus(sub.status),
            currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : null,
          },
        });

        return { statusCode: 200, body: 'ok' };
      }

      case 'invoice.paid':
      case 'invoice.payment_failed': {
        // Status sync still comes from subscription events. Ack-only for MVP.
        return { statusCode: 200, body: 'ok' };
      }

      default:
        return { statusCode: 200, body: 'ok' };
    }
  } catch (err) {
    return { statusCode: 400, body: `Webhook error: ${err?.message || 'unknown'}` };
  }
}
