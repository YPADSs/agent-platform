import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { ensureRecipeRecordInDatabase, listRecipeSummaries } from '@/lib/recipes';
import { requireSession } from '@/lib/session';
import { requirePlannerAccess, type SupportedMealSlot } from '@/lib/planner';

const slotToMealType: Record<SupportedMealSlot, string[]> = {
  breakfast: ['breakfast'],
  lunch: ['lunch', 'salad', 'soup'],
  dinner: ['dinner', 'salad', 'soup'],
  snack: ['snack', 'drink', 'dessert'],
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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim() ?? '';
    const slot = (searchParams.get('slot') ?? 'breakfast') as SupportedMealSlot;

    if (!['breakfast', 'lunch', 'dinner', 'snack'].includes(slot)) {
      return NextResponse.json({ error: 'INVALID_SLOT' }, { status: 422 });
    }

    const user = await getAuthenticatedUser();
    await requirePlannerAccess(user.id);

    const hints = slotToMealType[slot];
    const summaries = await listRecipeSummaries({ q, limit: 24 });
    const filtered = summaries.filter((recipe) => hints.includes(recipe.mealType)).slice(0, 12);

    const hydrated = await Promise.all(
      filtered.map(async (recipe) => {
        const record = await ensureRecipeRecordInDatabase(recipe.slug);
        if (!record) {
          return null;
        }

        return {
          id: record.id,
          slug: recipe.slug,
          title: recipe.title,
          mealType: recipe.mealType,
          description: recipe.description,
        };
      }),
    );

    return NextResponse.json({ recipes: hydrated.filter(Boolean) });
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
