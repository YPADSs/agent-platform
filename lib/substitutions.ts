import { getPrisma } from '@/lib/prisma';

export type SubstitutionSuggestion = {
  ingredientKey: string;
  displayName: string;
  reason: string;
  note: string | null;
  matchType: 'ingredient' | 'category';
};

function uniqueByKey<T>(items: T[], getKey: (item: T) => string) {
  const seen = new Set<string>();
  const output: T[] = [];

  for (const item of items) {
    const key = getKey(item);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    output.push(item);
  }

  return output;
}

export async function getSubstitutionsByIngredientKey(ingredientKey: string) {
  const prisma = getPrisma();
  const normalizedKey = ingredientKey.trim().toLowerCase();

  if (!normalizedKey) {
    const error = new Error('INVALID_INGREDIENT_KEY') as Error & { status?: number };
    error.status = 422;
    throw error;
  }

  const ingredient = await prisma.ingredientCatalog.findUnique({
    where: { key: normalizedKey },
    select: {
      id: true,
      key: true,
      defaultName: true,
      categoryKey: true,
    },
  });

  if (!ingredient) {
    return {
      ingredient: null,
      suggestions: [] as SubstitutionSuggestion[],
    };
  }

  const directRules = await prisma.ingredientSubstitutionRule.findMany({
    where: {
      isActive: true,
      sourceIngredientId: ingredient.id,
    },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    select: {
      reason: true,
      note: true,
      substituteIngredient: {
        select: {
          key: true,
          defaultName: true,
        },
      },
    },
  });

  const categoryRules = ingredient.categoryKey
    ? await prisma.ingredientSubstitutionRule.findMany({
        where: {
          isActive: true,
          sourceIngredientId: null,
          sourceCategoryKey: ingredient.categoryKey,
        },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        select: {
          reason: true,
          note: true,
          substituteIngredient: {
            select: {
              key: true,
              defaultName: true,
            },
          },
        },
      })
    : [];

  const directSuggestions: SubstitutionSuggestion[] = directRules.map((rule) => ({
    ingredientKey: rule.substituteIngredient.key,
    displayName: rule.substituteIngredient.defaultName,
    reason: rule.reason,
    note: rule.note,
    matchType: 'ingredient',
  }));

  const categorySuggestions: SubstitutionSuggestion[] = categoryRules.map((rule) => ({
    ingredientKey: rule.substituteIngredient.key,
    displayName: rule.substituteIngredient.defaultName,
    reason: rule.reason,
    note: rule.note,
    matchType: 'category',
  }));

  return {
    ingredient,
    suggestions: uniqueByKey(
      [...directSuggestions, ...categorySuggestions],
      (item) => item.ingredientKey,
    ),
  };
}
