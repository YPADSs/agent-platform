
export type ShoppingListBatchResult = {
  added: string[];
  skipped: string[];
};

export function normalizeShoppingListText(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function shoppingListKey(value: string): string {
  return normalizeShoppingListText(value).toLocaleLowerCase();
}

export function dedupeShoppingListTexts(
  incoming: string[],
  existing: string[],
): ShoppingListBatchResult {
  const existingKeys = new Set(existing.map(shoppingListKey));
  const added: string[] = [];
  const skipped: string[] = [];

  for (const raw of incoming) {
    const normalized = normalizeShoppingListText(raw);
    if (!normalized) continue;

    const key = shoppingListKey(normalized);
    if (existingKeys.has(key)) {
      skipped.push(normalized);
      continue;
    }

    existingKeys.add(key);
    added.push(normalized);
  }

  return { added, skipped };
}
