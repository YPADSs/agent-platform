import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/session';
import { getPrisma } from '@/lib/prisma';
import { getPlannerNutrientSummary } from '@/lib/planner-summary';
import { parseIsoDateOnly, requirePlannerAccess, startOfUtcDay } from '@/lib/planner';

type Params = { params: Promise<{ weekStart: string }> };

async function getAuthenticatedUser() {
  const session = await requireSession();
  const email = session.user?.email;

  if (!email) {
    const err = new Error('UNAUTHENTICATED') as Error & { status?: number };
    err.status = 401;
    throw err;
  }

  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) {
    const err = new Error('USER_NOT_FOUND') as Error & { status?: number };
    err.status = 404;
    throw err;
  }

  return user;
}

export async function GET(_: Request, { params }: Params) {
  try {
    const { weekStart } = await params;
    const weekStartDate = parseIsoDateOnly(weekStart);

    if (!weekStartDate) {
      return NextResponse.json({ error: 'INVALID_WEEK_START' }, { status: 422 });
    }

    const user = await getAuthenticatedUser();
    await requirePlannerAccess(user.id);

    const summary = await getPlannerNutrientSummary(user.id, startOfUtcDay(weekStartDate));
    return NextResponse.json({ summary });
  } catch (error) {
    const status = (error as { status?: number })?.status ?? 401;
    const code =
      status === 403
        ? 'PREMIUM_REQUIRED'
        : status === 404
        ? 'USER_NOT_FOUND'
        : 'UNAUTHENTICATED';

    return NextResponse.json({ error: code }, { status });
  }
}
