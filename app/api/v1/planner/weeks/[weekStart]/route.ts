import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/session';
import { getPrisma } from '@/lib/prisma';
import {
  getPlannerWeek,
  isDateInsideWeek,
  isSupportedMealSlot,
  parseIsoDateOnly,
  requirePlannerAccess,
  startOfUtcDay,
  upsertPlannerItem,
} from '@/lib/planner';

type Params = { params: Promise<{ weekStart: string }> };

type PlannerWeekRequestBody = {
  date?: unknown;
  slot?: unknown;
  slotIndex?: unknown;
  recipeId?: unknown;
  servings?: unknown;
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

export async function GET(_: Request, { params }: Params) {
  try {
    const { weekStart } = await params;
    const weekStartDate = parseIsoDateOnly(weekStart);

    if (!weekStartDate) {
      return NextResponse.json({ error: 'INVALID_WEEK_START' }, { status: 422 });
    }

    const user = await getAuthenticatedUser();
    await requirePlannerAccess(user.id);

    const week = await getPlannerWeek(user.id, startOfUtcDay(weekStartDate));
    return NextResponse.json({ week });
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

export async function PUT(req: Request, { params }: Params) {
  try {
    const { weekStart } = await params;
    const weekStartDate = parseIsoDateOnly(weekStart);

    if (!weekStartDate) {
      return NextResponse.json({ error: 'INVALID_WEEK_START' }, { status: 422 });
    }

    const body: PlannerWeekRequestBody = await req.json().catch(() => ({}));
    const planDate = typeof body.date === 'string' ? parseIsoDateOnly(body.date) : null;
    const slotIndex = typeof body.slotIndex === 'number' ? Math.trunc(body.slotIndex) : 1;
    const servings = typeof body.servings === 'number' ? Math.trunc(body.servings) : 1;

    if (!planDate || !isDateInsideWeek(planDate, weekStartDate)) {
      return NextResponse.json({ error: 'INVALID_PLAN_DATE' }, { status: 422 });
    }

    if (!isSupportedMealSlot(body.slot)) {
      return NextResponse.json({ error: 'INVALID_SLOT' }, { status: 422 });
    }

    if (typeof body.recipeId !== 'string' || !body.recipeId.trim()) {
      return NextResponse.json({ error: 'INVALID_RECIPE_ID' }, { status: 422 });
    }

    const user = await getAuthenticatedUser();
    await requirePlannerAccess(user.id);

    const item = await upsertPlannerItem({
      userId: user.id,
      weekStartDate,
      planDate,
      slot: body.slot,
      slotIndex,
      recipeId: body.recipeId,
      servings,
    });

    return NextResponse.json({ ok: true, item });
  } catch (error) {
    const status = (error as { status?: number })?.status ?? 401;
    const code =
      status === 403
        ? 'PREMIUM_REQUIRED'
        : status === 404
        ? ((error as Error).message === 'RECIPE_NOT_FOUND' ? 'RECIPE_NOT_FOUND' : 'USER_NOT_FOUND')
        : 'UNAUTHENTICATED';

    return NextResponse.json({ error: code }, { status });
  }
}
