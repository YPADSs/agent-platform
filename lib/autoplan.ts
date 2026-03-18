import { getPrisma } from '@/lib/prisma';
import { type SupportedMealSlot, addUtcDays, startOfUtcDay } from '@/lib/planner';
import { ensureRecipeRecordInDatabase, listRecipeSummaries } from '@/lib/recipes';
import { toIngredientKey } from '@/lib/pantry';

export type AutoplanSuggestion = {
  date: string;
  slot: SupportedMealSlot;
  slotIndex: number;
  servings: number;
  recipe: {
    id: string;
    slug: string;
    title: string;
    mealType: string;
    description: string;
  };
  reason: string;
};

export type AutoplanPlan = {
  weekStart: string;
  items: AutoplanSuggestion[];
  summary: {
    days: number;
    items: number;
    pantryMatches: number;
  };
};

const generationSlots: SupportedMealSlot[] = ['breakfast', 'lunch', 'dinner'];

const slotMealTypeHints: Record<SupportedMealSlot, string[]> = {
  breakfast: ['breakfast'],
  lunch: ['lunch', 'salad', 'soup'],
  dinner: ['dinner', 'salad', 'soup'],
  snack: ['snack', 'drink', 'dessert'],
};

function isoDate(date: Date) {
  return startOfUtcDay(date).toISOString().slice(0, 10);
}

function scoreRecipeAgainstPantry(recipe: Awaited<ReturnType<typeof listRecipeSummaries>>[number], pantryKeys: Set<string>) {
  return recipe.ingredientNames.reduce((score, ingredientName) => {
    return score + (pantryKeys.has(toIngredientKey(ingredientName)) ? 1 : 0);
  }, 0);
}

function reasonForSuggestion(
  slot: SupportedMealSlot,
  pantryHits: number,
  recipeTitle: string,
) {
  if (pantryHits > 1) {
    return `Good pantry fit for ${slot}: ${recipeTitle}.`;
  }

  if (pantryHits === 1) {
    return `Matches at least one pantry staple and fits ${slot}.`;
  }

  return `Balanced ${slot} option to keep the week structured.`;
}

export async function generateAutoplan(userId: string, weekStartDate: Date): Promise<AutoplanPlan> {
  const prisma = getPrisma();
  const pantryItems = await prisma.pantryItem.findMany({
    where: { userId },
    select: {
      ingredient: {
        select: {
          key: true,
        },
      },
    },
  });

  const pantryKeys = new Set(pantryItems.map((item) => item.ingredient.key));
  const summaries = await listRecipeSummaries({ limit: 50 });
  const items: AutoplanSuggestion[] = [];
  let pantryMatches = 0;
  const recentSlugs: string[] = [];

  for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
    const date = isoDate(addUtcDays(weekStartDate, dayIndex));

    for (let slotIndex = 0; slotIndex < generationSlots.length; slotIndex += 1) {
      const slot = generationSlots[slotIndex];
      const pool = summaries
        .filter((recipe) => slotMealTypeHints[slot].includes(recipe.mealType))
        .map((recipe) => ({
          recipe,
          pantryScore: scoreRecipeAgainstPantry(recipe, pantryKeys),
        }))
        .sort((left, right) => right.pantryScore - left.pantryScore || left.recipe.title.localeCompare(right.recipe.title));

      const candidate =
        pool.find((entry) => !recentSlugs.includes(entry.recipe.slug)) ??
        pool[(dayIndex + slotIndex) % Math.max(pool.length, 1)];

      if (!candidate) {
        continue;
      }

      const record = await ensureRecipeRecordInDatabase(candidate.recipe.slug);
      if (!record) {
        continue;
      }

      if (candidate.pantryScore > 0) {
        pantryMatches += 1;
      }

      recentSlugs.push(candidate.recipe.slug);
      if (recentSlugs.length > 5) {
        recentSlugs.shift();
      }

      items.push({
        date,
        slot,
        slotIndex: 1,
        servings: 1,
        recipe: {
          id: record.id,
          slug: candidate.recipe.slug,
          title: candidate.recipe.title,
          mealType: candidate.recipe.mealType,
          description: candidate.recipe.description,
        },
        reason: reasonForSuggestion(slot, candidate.pantryScore, candidate.recipe.title),
      });
    }
  }

  return {
    weekStart: isoDate(weekStartDate),
    items,
    summary: {
      days: 7,
      items: items.length,
      pantryMatches,
    },
  };
}
