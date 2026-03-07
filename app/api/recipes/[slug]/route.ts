import { NextResponse } from 'next/server';
import { getRecipeDetail } from '@/lib/recipes';

function parseServings(value: string | null): number | undefined {
  if (!value) return undefined;
  const servings = Number(value);
  if (!Number.isInteger(servings) || servings < 1 || servings > 20) {
    return NaN;
  }
  return servings;
}

export async function GET(
  req: Request,
  { params }: { params: { slug: string } },
) {
  const { searchParams } = new URL(req.url);
  const servings = parseServings(searchParams.get('servings'));

  if (Number.isNaN(servings)) {
    return NextResponse.json(
      { error: 'BAD_REQUEST', message: 'servings must be an integer between 1 and 20.' },
      { status: 400 },
    );
  }

  const recipe = await getRecipeDetail(params.slug, servings);

  if (!recipe) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  return NextResponse.json({
    recipe,
    actions: {
      favorite: {
        method: 'POST',
        href: `/api/recipes/${recipe.slug}/favorite`,
        requiresAuth: true,
      },
      addToShoppingList: {
        method: 'POST',
        href: `/api/recipes/${recipe.slug}/shopping-list`,
        requiresAuth: true,
      },
    },
  });
}
