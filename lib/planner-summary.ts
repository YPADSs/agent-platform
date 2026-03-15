import { getPrisma } from '@/lib/prisma';
import { getRecipeDetail, type RecipeNutrition } from '@/lib/recipes';
import { startOfUtcDay } from '@/lib/planner';

export type NutrientTotals = RecipeNutrition;

export type PlannerDaySummary = {
  date: string;
  itemCount: number;
  nutrients: NutrientTotals;
};

export type PlannerWeekSummary = {
  weekStart: string;
  days: PlannerDaySummary[];
  week
    : {
        itemCount: number;
        nutrients: NutrientTotals;
      };
};

function emptyNutrients(): NutrientTotals {
  return { calories: 0, protein: 0, fat: 0, carbs: 0 };
}

function round(value: number) {
  return Number(value.toFixed(1));
}

function addNutrients(target: NutrientTotals, source: RecipeNutrition) {
  target.calories = round(target.calories + source.calories);
  target.protein = round(target.protein + source.protein);
  target.fat = round(target.fat + source.fat);
  target.carbs = round(target.carbs + source.carbs);
}

export async function getPlannerNutrientSummary(userId: string, weekStartDate: Date): Promise<PlannerWeekSummary> {
  const prisma = getPrisma();
  const weekStart = startOfUtcDay(weekStartDate);
  const plan = await prisma.mealPlan.findUnique({
    where: {
      userId_weekStartDate: {
        userId,
        weekStartDate: weekStart,
      },
    },
    include: {
      items: {
        include: {
          recipe: { select: { slug: true } },
        },
        orderBy: [
          { planDate: 'asc' },
          { slot: 'asc' },
          { slotIndex: 'asc' },
        ],
      },
    },
  });

  const dayMap = new Map<string, PlannerDaySummary>();
  const weekTotals = { itemCount: 0, nutrients: emptyNutrients() };

  for (const item of plan?.items ?? []) {
    const recipe = await getRecipeDetail(item.recipe.slug, item.servings);
    if (!recipe) continue;

    const dayKey = startOfUtcDay(item.planDate).toISOString();
    const existing = dayMap.get(dayKey) ;
    const daySummary = existing ?? {
      date: dayKey,
      itemCount: 0,
      nutrients: emptyNutrients(),
    };

    daySummary.itemCount += 1;
    addNutrients(daySummary.nutrients, recipe.nutrition);
    dayMap.set(dayKey, daySummary);

    weekTotals.itemCount += 1;
    addNutrients(weekTotals.nutrients, recipe.nutrition);
  }

  return {
    weekStart: weekStart.toISOString(),
    days: Array.from(dayMap.values()).sort((a, b) => a.date.localeCompare(b.date)),
    week: weekTotals,
  };
}
