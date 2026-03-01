import { prisma } from './prisma';

export type Entitlements = {
  isPremium: boolean;
};

export async function getEntitlementsForUser(userId: string): Promise<Entitlements> {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  const isPremium = sub?.status === 'ACTIVE' && (!sub.currentPeriodEnd || sub.currentPeriodEnd > new Date());
  return { isPremium };
}
