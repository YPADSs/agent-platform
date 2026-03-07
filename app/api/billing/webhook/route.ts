import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import {
  extractStripeSubscriptionMapping,
  hasBillingEvent,
  markBillingEventProcessed,
  mapStripeCustomerToUserId,
  recordBillingEvent,
  upsertSubscriptionForUser,
} from '@/lib/billing';

async function syncSubscriptionFromStripe(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer?.id;

  if (!customerId) {
    return;
  }

  const userId = await mapStripeCustomerToUserId(customerId);
  if (!userId) {
    return;
  }

  const mapping = extractStripeSubscriptionMapping(subscription);
  await upsertSubscriptionForUser(userId, mapping);
}

export async function POST(req: Request) {
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'STRIPE_WEBHOOK_NOT_CONFIGURED' }, { status: 500 });
  }

  const rawBody = await req.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: 'INVALID_SIGNATURE' }, { status: 400 });
  }

  if (await hasBillingEvent(event.id)) {
    return NextResponse.json({ ok: true, idempotent: true });
  }

  await recordBillingEvent(event.id, event.type);

  try {
    if (
      event.type === 'customer.subscription.created' ||
      event.type === 'customer.subscription.updated' ||
      event.type === 'customer.subscription.deleted'
    ) {
      await syncSubscriptionFromStripe(event.data.object as Stripe.Subscription);
    }

    await markBillingEventProcessed(event.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'WEBHOOK_PROCESSING_FAILED' }, { status: 500 });
  }
}
