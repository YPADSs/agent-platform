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
  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: 'NO_STRIPE_CUSTOMER' }, { status: 400 });
  }
  const returnUrl = process.env.STRIPE_PORTAL_RETURN_URL;
  if (!returnUrl) return NextResponse.json({ error: 'STRIPE_NOT_CONFIGURED' }, { status: 500 });

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: returnUrl,
  });

  return NextResponse.json({ url: portalSession.url });
}
