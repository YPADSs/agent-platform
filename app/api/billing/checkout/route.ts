import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/session';
import { getStripe } from '@/lib/stripe';
import { getPrisma } from '@/lib/prisma';

export async function POST() {
  const session = await requireSession();
  const prisma = getPrisma();
  const stripe = getStripe();

  const email = session.user!.email!;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: 'USER_NOT_FOUND' }, { status: 404 });

  const priceId = process.env.STRIPE_PRICE_ID;
  const successUrl = process.env.STRIPE_SUCCESS_URL;
  const cancelUrl = process.env.STRIPE_CANCEL_URL;
  if (!priceId || !successUrl || !cancelUrl) {
    return NextResponse.json({ error: 'STRIPE_NOT_CONFIGURED' }, { status: 500 });
  }

  let customerId = user.stripeCustomerId ?? undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({ email });
    customerId = customer.id;
    await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: user.id,
    metadata: { userId: user.id },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
