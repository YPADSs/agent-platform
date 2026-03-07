import { NextResponse } from 'next/server';
import { listRecipeSummaries } from '@/lib/recipes';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');
  const mealType = searchParams.get('mealType');
  const ingredients = (searchParams.get('ingredients') ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  if (ingredients.length > 3) {
    return NextResponse.json(
      { error: 'BAD_REQUEST', message: 'A maximum of 3 ingredients is supported.' },
      { status: 400 },
    );
  }

  const recipes = await listRecipeSummaries({ q, mealType, ingredients });

  return NextResponse.json({
    recipes,
    filters: {
      q: q ?? '',
      mealType: mealType ?? '',
      ingredients,
    },
  });
}
