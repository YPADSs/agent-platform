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

  return {
    isPremium,
    canUsePlanner: isPremium,
    canUsePlannerShoppingAggregation: isPremium,
  };
}
