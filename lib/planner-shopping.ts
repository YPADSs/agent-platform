import { getPrisma } from '@/lib/prisma';
import { getRecipeDetail, getShoppingListPayload } from '@/lib/recipes';
import { startOfUtcDay } from '@/lib/planner';

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function textKey(value: string) {
  return normalizeText(value).toLocaleLowerCase();
}

export async function generatePlannerShoppingList(userId: string, weekStartDate: Date) {
  const prisma = getPrisma();
  const weekStart = startOfUtcDay(weekStartDate);
  const sourceId = weekStart.toISOString();

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
          recipe: {
            select: { slug: true, title: true },
          },
        },
        orderBy: [
          { planDate: 'asc' },
          { slot: 'asc' },
          { slotIndex: 'asc' },
        ],
      },
    },
  });

  const generatedTexts: string[] = [];

  for (const item of plan?.items ?? []) {
    const recipe = await getRecipeDetail(item.recipe.slug, item.servings);
    if (!recipe) continue;

    const payload = getShoppingListPayload(recipe);
    for (const text of payload) {
      const normalized = normalizeText(text);
      if (normalized) generatedTexts.push(normalized);
    }
  }

  const dedupedTexts = Array.from(new Map(generatedTexts.map((text) => [textKey(text), text])).values());

  await prisma.shoppingListItem.deleteMany({
    where: {
      userId,
      sourceType: 'PLANNER',
      sourceId,
    },
  });

  if (dedupedTexts.length) {
    await prisma.shoppingListItem.createMany({
      data: dedupedTexts.map((text) => ({
        userId,
        text,
        sourceType: 'PLANNER' as const,
        sourceId,
      })),
    });
  }

  const items = await prisma.shoppingListItem.findMany({
    where: {
      userId,
      sourceType: 'PLANNER',
      sourceId,
    },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      text: true,
      checked: true,
      sourceType: true,
      sourceId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return {
    ok: true,
    sourceId,
    added: items.length,
    items: items.map((item) => ({
      ...item,
      pantry: item.checked,
    })),
  };
}
