import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/session';
import { getStripe } from '@/lib/stripe';
import { getPrisma } from '@/lib/prisma';
import { getAccountStatusByEmail } from '@/lib/billing';

export async function POST() {
  const session = await requireSession();
  const email = session.user!.email!;
  const account = await getAccountStatusByEmail(email);
  if (!account) {
    return NextResponse.json({ error: 'USER_NOT_FOUND' }, { status: 404 });
  }

  if (account.subscription.isPremium) {
    return NextResponse.json({ error: 'ALREADY_PREMIUM' }, { status: 409 });
  }

  const prisma = getPrisma();
  const stripe = getStripe();

  const priceId = process.env.STRIPE_PRICE_ID;
  const successUrl = process.env.STRIPE_SUCCESS_URL;
  const cancelUrl = process.env.STRIPE_CANCEL_URL;
  if (!priceId || !successUrl || !cancelUrl) {
    return NextResponse.json({ error: 'STRIPE_NOT_CONFIGURED' }, { status: 500 });
  }

  let customerId = account.subscription.stripeCustomerId ?? undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({ email });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: account.user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: account.user.id,
    metadata: { userId: account.user.id },
  });

  return NextResponse.json({
    url: checkoutSession.url,
    subscription: account.subscription,
  });
}
