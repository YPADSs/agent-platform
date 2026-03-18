import { PantryItemSource, Prisma } from '@prisma/client';
import { getPrisma } from '@/lib/prisma';

type PatchPantryInput = {
  quantity?: number | null;
  unit?: string | null;
  displayName?: string | null;
  note?: string | null;
  lastConfirmedAt?: Date | null;
};

export type PantryItemSummary = {
  id: string;
  ingredientId: string;
  ingredientKey: string;
  defaultName: string;
  displayName: string;
  quantity: number | null;
  unit: string | null;
  source: PantryItemSource;
  sourceRefId: string | null;
  note: string | null;
  lastConfirmedAt: string | null;
  updatedAt: string;
};

const pantryItemSelect = {
  id: true,
  ingredientId: true,
  quantity: true,
  unit: true,
  source: true,
  sourceRefId: true,
  displayName: true,
  note: true,
  lastConfirmedAt: true,
  updatedAt: true,
  ingredient: {
    select: {
      key: true,
      defaultName: true,
    },
  },
} satisfies Prisma.PantryItemSelect;

type PantryRow = Prisma.PantryItemGetPayload<{
  select: typeof pantryItemSelect;
}>;

function toSummary(item: PantryRow): PantryItemSummary {
  return {
    id: item.id,
    ingredientId: item.ingredientId,
    ingredientKey: item.ingredient.key,
    defaultName: item.ingredient.defaultName,
    displayName: item.displayName ?? item.ingredient.defaultName,
    quantity: item.quantity === null ? null : Number(item.quantity),
    unit: item.unit,
    source: item.source,
    sourceRefId: item.sourceRefId,
    note: item.note,
    lastConfirmedAt: item.lastConfirmedAt?.toISOString() ?? null,
    updatedAt: item.updatedAt.toISOString(),
  };
}

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

export function toIngredientKey(value: string) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/^[a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function getUserIdByEmail(email: string) {
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) {
    const error = new Error('USER_NOT_FOUND') as Error & { status?: number };
    error.status = 404;
    throw error;
  }

  return user.id;
}

export async function getPantryByEmail(email: string) {
  const prisma = getPrisma();
  const userId = await getUserIdByEmail(email);
  const items = await prisma.pantryItem.findMany({
    where: { userId },
    orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
    select: pantryItemSelect,
  });

  return items.map(toSummary);
}

export async function createPantryItemByEmail(
  email: string,
  input: { name: string; quantity?: null | number; unit?: null | string; note?: null | string },
) {
  const prisma = getPrisma();
  const userId = await getUserIdByEmail(email);
  const displayName = normalizeText(input.name);
  const key = toIngredientKey(displayName);

  if (!key) {
    const error = new Error('INVALID_INGREDIENT_NAME') as Error & { status?: number };
    error.status = 422;
    throw error;
  }

  const ingredient = await prisma.ingredientCatalog.upsert({
    where: { key },
    update: {},
    create: {
      key,
      defaultName: displayName,
    },
    select: { id: true },
  });

  const existing = await prisma.pantryItem.findUnique({
    where: {
      userId_ingredientId: {
        userId,
        ingredientId: ingredient.id,
      },
    },
    select: { id: true },
  });

  if (existing) {
    const error = new Error('DUPLICATE_PANTRY_ITEM') as Error & { status?: number };
    error.status = 409;
    throw error;
  }

  const item = await prisma.pantryItem.create({
    data: {
      userId,
      ingredientId: ingredient.id,
      quantity:
        input.quantity === null || input.quantity === undefined
          ? null
          : new Prisma.Decimal(input.quantity),
      unit: input.unit ?? null,
      displayName,
      note: input.note ?? null,
      source: PantryItemSource.MANUAL,
    },
    select: pantryItemSelect,
  });

  return toSummary(item);
}

export async function updatePantryItemByEmail(email: string, itemId: string, input: PatchPantryInput) {
  const prisma = getPrisma();
  const userId = await getUserIdByEmail(email);

  const existing = await prisma.pantryItem.findFirst({
    where: { id: itemId, userId },
    select: { id: true },
  });

  if (!existing) {
    const error = new Error('PANTRY_ITEM_NOT_FOUND') as Error & { status?: number };
    error.status = 404;
    throw error;
  }

  const item = await prisma.pantryItem.update({
    where: { id: itemId },
    data: {
      ...(input.quantity !== undefined
        ? {
            quantity: input.quantity === null ? null : new Prisma.Decimal(input.quantity),
          }
        : {}),
      ...(input.unit !== undefined ? { unit: input.unit } : {}),
      ...(input.displayName !== undefined ? { displayName: input.displayName } : {}),
      ...(input.note !== undefined ? { note: input.note } : {}),
      ...(input.lastConfirmedAt !== undefined ? { lastConfirmedAt: input.lastConfirmedAt } : {}),
    },
    select: pantryItemSelect,
  });

  return toSummary(item);
}

export async function deletePantryItemByEmail(email: string, itemId: string) {
  const prisma = getPrisma();
  const userId = await getUserIdByEmail(email);

  const existing = await prisma.pantryItem.findFirst({
    where: { id: itemId, userId },
    select: { id: true },
  });

  if (!existing) {
    const error = new Error('PANTRY_ITEM_NOT_FOUND') as Error & { status?: number };
    error.status = 404;
    throw error;
  }

  await prisma.pantryItem.delete({
    where: { id: itemId },
  });
}
