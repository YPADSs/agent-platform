import { getPrisma } from '@/lib/prisma';
import { getEntitlementsForUser } from '@/lib/entitlements';

export const SUPPORTED_MEAL_SLOTS = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
export type SupportedMealSlot = (typeof SUPPORTED_MEAL_SLOTS)[number];

const slotToDb = {
  breakfast: 'BREAKFAST',
  lunch: 'LUNCH',
  dinner: 'DINNER',
  snack: 'SNACK',
} as const;

const slotFromDb = {
  BREAKFAST: 'breakfast',
  LUNCH: 'lunch',
  DINNER: 'dinner',
  SNACK: 'snack',
} as const;

export function isSupportedMealSlot(value: unknown): value is SupportedMealSlot {
  return typeof value === 'string' && SUPPORTED_MEAL_SLOTS.includes(value as SupportedMealSlot);
}

export function parseIsoDateOnly(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function startOfUtcDay(value: Date) {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}

export function addUtcDays(value: Date, days: number) {
  const copy = new Date(value);
  copy.setUTCDate(copy.getUTCDate() + days);
  return startOfUtcDay(copy);
}

export function isDateInsideWeek(planDate: Date, weekStartDate: Date) {
  const start = startOfUtcDay(weekStartDate).getTime();
  const end = addUtcDays(weekStartDate, 7).getTime();
  const current = startOfUtcDay(planDate).getTime();
  return current >= start && current < end;
}

export async function requirePlannerAccess(userId: string) {
  const entitlements = await getEntitlementsForUser(userId);
  if (!entitlements.isPremium && !entitlements.canUsePlanner) {
    const err = new Error('PREMIUM_REQUIRED') as Error & { status?: number };
    err.status = 403;
    throw err;
  }
  return entitlements;
}

export async function getPlannerWeek(userId: string, weekStartDate: Date) {
  const prisma = getPrisma();
  const plan = await prisma.mealPlan.findUnique({
    where: {
      userId_weekStartDate: {
        userId,
        weekStartDate,
      },
    },
    include: {
      items: {
        orderBy: [
          { planDate: 'asc' },
          { slot: 'asc' },
          { slotIndex: 'asc' },
        ],
        include: {
          recipe: {
            select: { id: true, slug: true, title: true },
          },
        },
      },
    },
  });

  return {
    weekStart: weekStartDate.toISOString(),
    items:
      plan?.items.map((item) => ({
        id: item.id,
        date: item.planDate.toISOString(),
        slot: slotFromDb[item.slot],
        slotIndex: item.slotIndex,
        servings: item.servings,
        recipe: item.recipe,
      })) ?? [],
  };
}

export async function upsertPlannerItem(params: {
  userId: string;
  weekStartDate: Date;
  planDate: Date;
  slot: SupportedMealSlot;
  slotIndex?: number;
  recipeId: string;
  servings?: number;
}) {
  const prisma = getPrisma();
  const weekStartDate = startOfUtcDay(params.weekStartDate);
  const planDate = startOfUtcDay(params.planDate);
  const slotIndex = params.slotIndex && params.slotIndex > 0 ? params.slotIndex : 1;
  const servings = params.servings && params.servings > 0 ? params.servings : 1;

  const recipe = await prisma.recipe.findUnique({
    where: { id: params.recipeId },
    select: { id: true, slug: true, title: true },
  });

  if (!recipe) {
    const err = new Error('RECIPE_NOT_FOUND') as Error & { status?: number };
    err.status = 404;
    throw err;
  }

  const plan = await prisma.mealPlan.upsert({
    where: {
      userId_weekStartDate: {
        userId: params.userId,
        weekStartDate,
      },
    },
    create: {
      userId: params.userId,
      weekStartDate,
    },
    update: {},
    select: { id: true },
  });

  const item = await prisma.mealPlanItem.upsert({
    where: {
      mealPlanId_planDate_slot_slotIndex: {
        mealPlanId: plan.id,
        planDate,
        slot: slotToDb[params.slot],
        slotIndex,
      },
    },
    create: {
      mealPlanId: plan.id,
      planDate,
      slot: slotToDb[params.slot],
      slotIndex,
      recipeId: params.recipeId,
      servings,
    },
    update: {
      recipeId: params.recipeId,
      servings,
    },
    include: {
      recipe: {
        select: { id: true, slug: true, title: true },
      },
    },
  });

  return {
    id: item.id,
    date: item.planDate.toISOString(),
    slot: slotFromDb[item.slot],
    slotIndex: item.slotIndex,
    servings: item.servings,
    recipe: item.recipe,
  };
}

export async function deletePlannerItem(userId: string, itemId: string) {
  const prisma = getPrisma();
  const item = await prisma.mealPlanItem.findUnique({
    where: { id: itemId },
    include: {
      mealPlan: {
        select: { userId: true },
      },
    },
  });

  if (!item || item.mealPlan.userId !== userId) {
    const err = new Error('NOT_FOUND') as Error & { status?: number };
    err.status = 404;
    throw err;
  }

  await prisma.mealPlanItem.delete({ where: { id: itemId } });
  return { ok: true, id: itemId };
}
