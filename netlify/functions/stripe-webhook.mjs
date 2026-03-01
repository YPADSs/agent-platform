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

    // Idempotency ledger
    try {
      await prisma.billingEvent.create({
        data: { stripeEventId: stripeEvent.id, type: stripeEvent.type, processedAt: new Date() },
      });
    } catch (e) {
      // unique violation => already processed
      return { statusCode: 200, body: 'ok' };
    }

    if (stripeEvent.type.startsWith('customer.subscription.')) {
      const sub = stripeEvent.data.object;
      const customerId = sub.customer;
      const user = await prisma.user.findUnique({ where: { stripeCustomerId: customerId } });
      if (user) {
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
      }
    }

    return { statusCode: 200, body: 'ok' };
  } catch (err) {
    return { statusCode: 400, body: `Webhook error: ${err?.message || 'unknown'}` };
  }
}
