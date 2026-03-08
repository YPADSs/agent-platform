import { getPrisma } from '@/lib/prisma';

export type Entitlements = {
  isPremium: boolean;
  canUsePlanner: boolean;
  canUsePlannerShoppingAggregation: boolean;
};

function isActive(status: string, currentPeriodEnd?: Date | null) {
  if (status !== 'ACTIVE') return false;
  if (!currentPeriodEnd) return true;
  return currentPeriodEnd.getTime() > Date.now();
}

export async function getEntitlementsForUser(userId: string): Promise<Entitlements> {
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      subscription: {
        select: {
          status: true,
          currentPeriodEnd: true,
        },
      },
    },
  });

  const isPremium = isActive(
    user?.subscription?.status ?? 'INACTIVE',
    user?.subscription?.currentPeriodEnd ?? null
  );

  const canUsePlanner = user?.role === 'ADMIN' ? true : isPremium;
  const canUsePlannerShoppingAggregation = canUsePlanner;

  return { isPremium, canUsePlanner, canUsePlannerShoppingAggregation };
}
