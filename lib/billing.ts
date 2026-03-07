import type Stripe from 'stripe';
import { getPrisma } from '@/lib/prisma';

export type AccountStatus = {
  user: {
    id: string;
    email: string;
    role: 'USER' | 'ADMIN';
  };
  subscription: {
    status: 'INACTIVE' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED';
    isPremium: boolean;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
    currentPeriodEnd: string | null;
  };
};

export type StripeSubscriptionMapping = {
  stripeSubscriptionId: string | null;
  status: 'INACTIVE' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED';
  currentPeriodEnd: Date | null;
};

export function isPremiumStatus(
  status: 'INACTIVE' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED',
): boolean {
  return status === 'ACTIVE' || status === 'PAST_DUE';
}

export function mapStripeSubscriptionStatus(
  status: Stripe.Subscription.Status,
): 'INACTIVE' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' {
  if (status === 'active' || status === 'trialing') return 'ACTIVE';
  if (status === 'past_due' || status === 'unpaid') return 'PAST_DUE';
  if (status === 'canceled' || status === 'incomplete_expired') {
    return 'CANCELED';
  }
  return 'INACTIVE';
}

export function extractStripeSubscriptionMapping(
  subscription: Stripe.Subscription,
[
  ]
 = [],
): StripeSubscriptionMapping {
  const currentPeriodEnd =
    typeof subscription.current_period_end === 'number'
      ? new Date(subscription.current_period_end * 1000)
      : null;

  return {
    stripeSubscriptionId: subscription.id ?? null,
    status: mapStripeSubscriptionStatus(subscription.status),
    currentPeriodEnd,
  };
}

export async function getAccountStatusByEmail(email: string): Promise<AccountStatus | null> {
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      role: true,
      stripeCustomerId: true,
      subscription: {
        select: {
          status: true,
          stripeSubscriptionId: true,
          currentPeriodEnd: true,
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  const status = user.subscription?.status ?? 'INACTIVE';
  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    subscription: {
      status,
      isPremium: isPremiumStatus(status),
      stripeCustomerId: user.stripeCustomerId ?? null,
      stripeSubscriptionId: user.subscription?.stripeSubscriptionId ?? null,
      currentPeriodEnd: user.subscription?.currentPeriodEnd
        ? user.subscription.currentPeriodEnd.toISOString()
        : null,
    },
  };
}

export async function upsertSubscriptionForUser(
  userId: string,
  mapping: StripeSubscriptionMapping,
) {
  const prisma = getPrisma();
  return prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeSubscriptionId: mapping.stripeSubscriptionId,
      status: mapping.status,
      currentPeriodEnd: mapping.currentPeriodEnd,
    },
    update: {
      stripeSubscriptionId: mapping.stripeSubscriptionId,
      status: mapping.status,
      currentPeriodEnd: mapping.currentPeriodEnd,
    },
  });
}

export async function mapStripeCustomerToUserId(customerId: string) {
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
    select: { id: true },
  });
  return user?.id ?? null;
}

export async function hasBillingEvent(eventId: string) {
  const prisma = getPrisma();
  const event = await prisma.billingEvent.findUnique({
    where: { stripeEventId: eventId },
    select: { id: true },
  });
  return Boolean(event);
}

export async function recordBillingEvent(eventId: string, type: string) {
  const prisma = getPrisma();
  return prisma.billingEvent.create({
    data: { stripeEventId: eventId, type },
  });
}

export async function markBillingEventProcessed(eventId: string) {
  const prisma = getPrisma();
  return prisma.billingEvent.update({
    where: { stripeEventId: eventId },
    data: { processedAt: new Date() },
  });
}
