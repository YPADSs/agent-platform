import type { MealSlot } from '@prisma/client';
import { getPrisma } from '@/lib/prisma';
import { getEntitlementsForUser } from '@/lib/entitlements';
import { getRecipeDetail } from '@/lib/recipes';

export const SUPPORTED_MEAL_SLOTS = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
export type SupportedMealSlot = (typeof SUPPORTED_MEAL_SLOTS)[number];

type PlannerWarningCode =
  | 'MISSING_NUTRITION'
  | 'RECIPE_UNAVAILABLE'
  | 'UNSUPPORTED_UNIT_CONVERSION';

export type PlannerWarning = {
  code: PlannerWarningCode;
  itemId: string;
};

export type PlannerShoppingListItem = {
  ingredientKey: string;
  displayName: string;
  quantity: number | null;
  unit: string | null;
  category: null;
  sourceCount: number;
  sourceRefs: Array<{
    mealPlanItemId: string;
    recipeId: string | null;
    day: string;
    slot: SupportedMealSlot;
  };
  mergeStatus: 'merged' | 'separate' | 'partial';
};

const slotToDb: Record<SupportedMealSlot, MealSlot> = {
  breakfast: 'BREAKFAST',
  lunch: 'LUNCH',
  dinner: 'DINNER',
  snack: 'SNACK',
};

const slotFromDb: Record<MealSlot, SupportedMealSlot> = {
  BREAKFAST: 'breakfast',
  LUNCH: 'lunch',
  DINNER: 'dinner',
  SNACK: 'snack',
};

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

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function roundAmount(value: number) {
  if (value >= 100) return Math.round(value);
  if (value >= 10) return Number(value.toFixed(1));
  return Number(value.toFixed(2));
}

function getIsoDay(value: Date) {
  return startOfUtcDay(value).toISOString().slice(0, 10);
}

async function getPlannerUnitSystem(userId: string): Promise<\n'metric' | 'imperial'> {
  const prisma = getPrisma();
  const preferences = await prisma.userPreferences.findUnique({
    where: { userId },
    select: { unitSystem: true },
  });

  return preferences?.unitSystem === 'IMPERIAL' ? 'imperial' : 'metric';
}

function convertUnitForSystem(
  amount: number,
  unit: string,
  unitSystem: 'metric' | 'imperial',
]: { quantity: number; unit: string; warning?: 'UNSUPPORTED_UNIT_CONVERSION' } {
  if (unitSystem === 'metric') {
    return { quantity: amount, unit };
  }

  const normalizedUnit = normalizeText(unit);

  if (normalizedUnit === 'g') {
    return { quantity: amount / 28.3495, unit: 'oz' };
  }

  if (normalizedUnit === 'ml') {
    return { quantity: amount / 29.5735, unit: 'fl oz' };
  }

  if (
    normalizedUnit === 'pc' ||
    normalizedUnit === 'pcs' ||
    normalizedUnit === 'piece' ||
    normalizedUnit === 'pieces' ||
    normalizedUnit === 'tbsp' ||
    normalizedUnit === 'tsp' ||
    normalizedUnit === 'clove'
  ) {
    return { quantity: amount, unit };
  }

  return { quantity: amount, unit, warning: 'UNSUPPORTED_UNIT_CONVERSION' };
}

async function getPlannerWeekData(userId: string, weekStartDate: Date) {
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
        orderBy: [{planDate: 'asc'}, { slot: 'asc'}, { slotIndex: 'asc' }],
        include: {
          recipe: {
            select: { id: true, slug: true, title: true },
          },
        },
      },
    },
  });

  return plan?.items ?? [];
}

export async function requirePlannerAccess(userId: string) {
  const entitlements = await getEntitlementsForUser(userId);
  if (!entitlements.canUsePlanner) {
    const err = new Error('PREMIUM_REQUIRED') as Error & { status?: number };
    err.status = 403;
    throw err;
  }
  return entitlements;
}

export async function getPlannerWeek(userId: string, weekStartDate: Date) {
  const items = await getPlannerWeekData(userId, weekStartDate);

  const warnings: PlannerWarning[] = [];
  let calories = 0;
  let protein = 0;
  let fat = 0;
  let carbs = 0;
  let missingItemCount = 0;

  for (const item of items) {
    const detail = await getRecipeDetail(item.recipe.slug, item.servings);

    if (!detail) {
      missingItemCount += 1;
      warnings.push({ code: 'RECIPE_UNAVAILABLE', itemId: item.id });
      continue;
    }

    if (!detail.nutrition) {
      missingItemCount += 1;
      warnings.push({ code: 'MISSING_NUTRITION', itemId: item.id });
      continue;
    }

    calories += detail.nutrition.calories;
    protein += detail.nutrition.protein;
    fat += detail.nutrition.fat;
    carbs += detail.nutrition.carbs;
  }

  return {
    weekStart: weekStartDate.toISOString(),
    items: items.map((item) => ({
      id: item.id,
      date: item.planDate.toISOString(),
      slot: slotFromDb[item.slot],
      slotIndex: item.slotIndex,
      servings: item.servings,
      recipe: item.recipe,
    })),
    summary: {
      totals: {
        calories: roundAmount(calories),
        protein_g: roundAmount(protein),
        fat_g: roundAmount(fat),
        carbs_g: roundAmount(carbs),
      },
      completeness: {
        hasMissingNutrition: missingItemCount > 0,
        missingItemCount,
        isPartial: missingItemCount > 0,
      },
    },
    warnings,
  };
}

export async function getPlannerWeekShoppingList(userId: string, weekStartDate: Date) {
  const items = await getPlannerWeekData(userId, weekStartDate);
  const unitSystem = await getPlannerUnitSystem(userId);

  const warnings: PlannerWarning[] = [];
  const aggregated = new Map<string, PlannerShoppingListItem>();

  for (const item of items) {
    const slot = slotFromDb[item.slot];
    const detail = await getRecipeDetail(item.recipe.slug, item.servings);

    if (!detail) {
      warnings.push({ code: 'RECIPE_UNAVAILABLE', itemId: item.id });
      continue;
    }

    for (const ingredient of detail.ingredients) {
      const conversion = convertUnitForSystem(ingredient.amount, ingredient.unit, unitSystem);

      if (conversion.warning) {
        warnings.push({ code: conversion.warning, itemId: item.id });
      }

      const key = `${normalizeText(ingredient.name)}::${normalizeText(conversion.unit)}`;
      const existing = aggregated.get(key);

      const sourceRef = {
        mealPlanItemId: item.id,
        recipeId: item.recipe.id,
        day: getIsoDay(item.planDate),
        slot,
      };

      if (!existing) {
        aggregated.set(key, {
          ingredientKey: key,
          displayName: ingredient.name,
          quantity: roundAmount(conversion.quantity),
          unit: conversion.unit,
          category: null,
          sourceCount: 1,
          sourceRefs: [sourceRef],
          mergeStatus: 'separate',
        });
        continue;
      }

      existing.quantity = roundAmount((existing.quantity ?? 0) + conversion.quantity);
      existing.sourceCount += 1;
      existing.sourceRefs.push(sourceRef);
      existing.mergeStatus = 'merged';
    }
  }

  return {
    weekStart: weekStartDate.toISOString(),
    unitSystem,
    items: Array.from(aggregated.values()).sort((a, b) => a.displayName.localeCompare(b.displayName)),
    warnings,
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
