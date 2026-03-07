import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/session';
import { getStripe } from '@/lib/stripe';
import { getAccountStatusByEmail } from '@/lib/billing';

export async function POST() {
  const session = await requireSession();
  const email = session.user!.email!;
  const account = await getAccountStatusByEmail(email);
  if (!account) {
    return NextResponse.json({ error: 'USER_NOT_FOUND' }, { status: 404 });
  }

  if (!account.subscription.stripeCustomerId) {
    return NextResponse.json({ error: 'NO_STRIPE_CUSTOMER' }, { status: 400 });
  }

  const returnUrl = process.env.STRIPE_PORTAL_RETURN_URL;
  if (!returnUrl) {
    return NextResponse.json({ error: 'STRIPE_NOT_CONFIGURED' }, { status: 500 });
  }

  const stripe = getStripe();
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: account.subscription.stripeCustomerId,
    return_url: returnUrl,
  });

  return NextResponse.json({
    url: portalSession.url,
    subscription: account.subscription,
  });
}
