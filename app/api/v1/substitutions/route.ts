import { NextResponse } from 'next/server';
import { getSubstitutionsByIngredientKey } from '@/lib/substitutions';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ingredientKey = searchParams.get('ingredientKey')?.trim() ?? '';

    if (!ingredientKey) {
      return NextResponse.json({ error: 'MISSING_INGREDIENT_KEY' }, { status: 422 });
    }

    const result = await getSubstitutionsByIngredientKey(ingredientKey);

    return NextResponse.json({
      ingredient: result.ingredient,
      suggestions: result.suggestions,
    });
  } catch (error) {
    const status = (error as { status?: number })?.status ?? 500;
    const message = (error as Error).message || 'INTERNAL_SERVER_ERROR';

    return NextResponse.json({ error: message }, { status });
  }
}
