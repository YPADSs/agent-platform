import { getPrisma } from '@/lib/prisma';
import { requireSession } from '@/lib/session';

let memo: { email: string; value: boolean; empty: boolean; ts: number } | null = null;

const TTL_MS = 30_000; // short TTL to avoid too-many DB reads on hot routes

function isActive(status: string, currentPeriodEnd?: Date | null) {
  if (status !== 'ACTIVE') return false;
  if (!currentPeriodEnd) return true;
  return currentPeriodEnd.getTime() > Date.now();
}

export async function isPremium(): Promise<boolean> {
  const session = await requireSession();
  const email = session.user!.email!;

  if (memo && memo.email === email && (Date.now() - memo.ts) < TTL_MS) {
    return memo.value;
  }

  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      subscription: { select: { status: true, currentPeriodEnd: true } },
      role: true,
    },
  });

  const value = user?.role === 'ADMIN' ? true : isActive(user?.subscription?.status ?? 'INACTIVE', user?.subscription?.currentPeriodEnd);
  memo = { email, value, empty: !user, ts: Date.now() };
  return value;
}

export async function requirePremium(): Promise<void> {
  const ok = await isPremium();
  if (!ok) {
    const err = new Error('PREMIUM_REQUIRED') as Error & { status?: number };
    err.status = 403;
    throw err;
  }
}
