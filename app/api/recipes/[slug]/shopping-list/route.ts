import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/session';
import { getPrisma } from '@/lib/prisma';
import { getRecipeDetail, getShoppingListPayload } from '@/lib/recipes';

function parseServings(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    return undefined;
  }

  if (value < 1 || value > 20) {
    return undefined;
  }

  return value;
}

async function getAuthenticatedUserId() {
  const session = await requireSession();
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { email: session.user!.email! },
    select: { id: true },
  });

  if (!user) {
    return null;
  }

  return user.id;
}

export async function POST(
  req: Request,
  { params }: { params: { slug: string } },
) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: 'USER_NOT_FOUND' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const servings = parseServings(body?.servings);
    const recipe = await getRecipeDetail(params.slug, servings);

    if (!recipe) {
      return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
    }

    const items = getShoppingListPayload(recipe);
    if (!items.length) {
      return NextResponse.json(
        { error: 'BAD_REQUEST', message: 'Recipe has no shopping-list items.' },
        { status: 400 },
      );
    }

    const prisma = getPrisma();
    await prisma.shoppingListItem.createMany({
      data: items.map((text) => ({
        userId,
        text,
      })),
    });

    return NextResponse.json({
      ok: true,
      added: items.length,
      items,
      recipe: {
        slug: recipe.slug,
        title: recipe.title,
        servings: recipe.servings,
      },
    });
  } catch {
    return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 });
  }
}
