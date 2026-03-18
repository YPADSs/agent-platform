import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import {
  isDateInsideWeek,
  isSupportedMealSlot,
  parseIsoDateOnly,
  requirePlannerAccess,
  startOfUtcDay,
  upsertPlannerItem,
} from '@/lib/planner';
import { requireSession } from '@/lib/session';

type ApplyItemBody = {
  date?: unknown;
  slot?: unknown;
  slotIndex?: unknown;
  recipeId?: unknown;
  servings?: unknown;
};

type ApplyBody = {
  weekStart?: unknown;
  items?: ApplyItemBody[];
};

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

export async function POST(req: Request) {
  try {
    const body: ApplyBody = await req.json().catch(() => ({}));
    const weekStartDate =
      typeof body.weekStart === 'string' ? parseIsoDateOnly(body.weekStart) : null;

    if (!weekStartDate) {
      return NextResponse.json({ error: 'INVALID_WEEK_START' }, { status: 422 });
    }

    if (!Array.isArray(body.items) || !body.items.length) {
      return NextResponse.json({ error: 'INVALID_ITEMS' }, { status: 422 });
    }

    const normalizedWeekStart = startOfUtcDay(weekStartDate);
    const user = await getAuthenticatedUser();
    await requirePlannerAccess(user.id);

    const applied = [];

    for (const item of body.items) {
      const planDate = typeof item.date === 'string' ? parseIsoDateOnly(item.date) : null;
      const slotIndex = typeof item.slotIndex === 'number' ? Math.trunc(item.slotIndex) : 1;
      const servings = typeof item.servings === 'number' ? Math.trunc(item.servings) : 1;

      if (!planDate || !isDateInsideWeek(planDate, normalizedWeekStart)) {
        return NextResponse.json({ error: 'INVALID_PLAN_DATE' }, { status: 422 });
      }

      if (!isSupportedMealSlot(item.slot)) {
        return NextResponse.json({ error: 'INVALID_SLOT' }, { status: 422 });
      }

      if (typeof item.recipeId !== 'string' || !item.recipeId.trim()) {
        return NextResponse.json({ error: 'INVALID_RECIPE_ID' }, { status: 422 });
      }

      applied.push(
        await upsertPlannerItem({
          userId: user.id,
          weekStartDate: normalizedWeekStart,
          planDate,
          slot: item.slot,
          slotIndex,
          recipeId: item.recipeId,
          servings,
        }),
      );
    }

    return NextResponse.json({ ok: true, appliedCount: applied.length, items: applied });
  } catch (error) {
    const status = (error as { status?: number })?.status ?? 401;
    const message = (error as Error).message;
    const code =
      status === 403
        ? 'PREMIUM_REQUIRED'
        : status === 404
        ? message === 'RECIPE_NOT_FOUND'
          ? 'RECIPE_NOT_FOUND'
          : 'USER_NOT_FOUND'
        : 'UNAUTHENTICATED';

    return NextResponse.json({ error: code }, { status });
  }
}
