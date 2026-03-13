
'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type PlannerRecipe = {
  id: string;
  slug: string;
  title: string;
};

type PlannerItem = {
  id: string;
  date: string;
  slot: MealSlot;
  slotIndex: number;
  servings: number;
  recipe: PlannerRecipe;
};

type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack';

type PlannerWarning = {
  code: 'MISSING_NUTRITION' | 'RECIPE_UNAVAILABLE' | 'UNSUPPORTED_UNIT_CONVERSION';
  itemId: string;
};

type PlannerWeekResponse = {
  week: {
    weekStart: string;
    items: PlannerItem[];
    summary?: {
      totals: {
        calories: number;
        protein_g: number;
        fat_g: number;
        carbs_g: number;
      };
      completeness: {
        hasMissingNutrition: boolean;
        missingItemCount: number;
        isPartial: boolean;
      };
    };
    warnings?: PlannerWarning[];
  };
};

type ShoppingListItem = {
  ingredientKey: string;
  displayName: string;
  quantity: number;
  unit: string;
  category: null;
  sourceCount: number;
  sourceRefs: Array<{
    mealPlanItemId: string;
    recipeId: string | null;
    day: string;
    slot: MealSlot;
  }>;
  mergeStatus: 'merged' | 'separate' | 'partial';
};

type ShoppingListResponse = {
  shoppingList: {
    weekStart: string;
    unitSystem: 'metric' | 'imperial';
    items: ShoppingListItem[];
    warnings?: PlannerWarning[];
  };
};

type RecipeSummary = {
  slug: string;
  title: string;
  description: string;
  mealType: string;
  servings: number;
  nutrition: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
};

type RecipeSearchResponse = {
  recipes: RecipeSummary[];
};

const MEAL_SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snack'];
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Frig', 'Sat', 'Sun'];

function startOfWeek(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  return copy;
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDayHeading(date: Date, index: number) {
  return `${DAY_LABELS[index]} ${date.getDate()}`;
}

function getSlotLabel(slot: MealSlot) {
  return slot.charAt(0).toUpperCase() + slot.slice(1);
}

function getWarningLabel(code: PlannerWarning['code']) {
  switch (code) {
    case 'MISSING_NUTRITION':
      return 'Some recipe nutrition is unavailable.';
    case 'RECIPE_UNAVAILABLE':
      return 'A recipe in this week is no longer available.';
    case 'UNSUPPORTED_UNIT_CONVERSION':
      return 'Some shopping list units stayed unchanged to avoid unsafe conversion.';
    default:
      return 'Planner warning';
  }
}

export default function PlannerCalendar() {
  const [weekStart, setWeekStart] = useState(() => formatDateInput(startOfWeek(new Date())));
  const [week, setWeek] = useState<PlannerWeekResponse['week'] | null>(null);
  const [shoppingList, setShoppingList] = useState<ShoppingListResponse['shoppingList'] | null>(null);
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [loadingWeek, setLoadingWeek] = useState(true);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeComposer, setActiveComposer] = useState<{ date: string; slot: MealSlot } | null>(null);
  const [recipeQuery, setRecipeQuery] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadWeek(targetWeekStart: string) {
    setLoadingWeek(true);
    setError(null);

    try {
      const [weekResponse, shoppingListResponse] = await Promise.all([
        fetch(`/api/v1/planner/weeks/${targetWeekStart}`, { cache: 'no-store' }),
        fetch(`/api/v1/planner/weeks/${targetWeekStart}/shopping-list`, { cache: 'no-store' }),
      ]);

      const weekData = (await weekResponse.json().catch(() => ({}))) as Partial<PlannerWeekResponse>;
      const shoppingListData = (await shoppingListResponse.json().catch(() => ({}))) as Partial<ShoppingListResponse>;

      if (!weekResponse.ok) {
        setError((weekData as { error?: string }).error ?? 'Unable to load this planner week.');
        return;
      }

      if (!shoppingListResponse.ok) {
        setError((shoppingListData as { error?: string }).error ?? 'Unable to load planner shopping list.');
        return;
      }

      setWeek(weekData.week ?? null);
      setShoppingList(shoppingListData.shoppingList ?? null);
    } catch {
      setError('Network error while loading planner data.');
    } finally {
      setLoadingWeek(false);
    }
  }

  async function loadRecipes(slot: MealSlot, query: string) {
    setLoadingRecipes(true);

    try {
      const searchParams = new URLSearchParams();
      searchParams.set('mealType', slot);
      if (query.trim()) {
        searchParams.set('q', query.trim());
      }

      const response = await fetch(`/api/recipes?${searchParams.toString()}`, { cache: 'no-store' });
      const data = (await response.json().catch(() => ({})) as Partial<RecipeSearchResponse>;

      if (!response.ok) {
        setRecipes([]);
        return;
      }

      setRecipes(data.recipes ?? []);
    } catch {
      setRecipes([]);
    } finally {
      setLoadingRecipes(false);
    }
  }

  useEffect(() => {
    void loadWeek(weekStart);
  }, [weekStart]);

  useEffect(() => {
    if (!activeComposer) {
      setRecipes([]);
      return;
    }

    void loadRecipes(activeComposer.slot, recipeQuery);
  }, [activeComposer, recipeQuery]);

  const weekDates = useMemo(() => {
    const start = startOfWeek(new Date(weekStart));
    return Array.from({ length: 7 }, (_, index) => addDays(start, index));
  }, [weekStart]);

  const itemsByDayAndSlot = useMemo(() => {
    const map = new Map<string, PlannerItem[]>();

    for (const item of week?.items ?? []) {
      const key = `${item.date.slice(0, 10)}::${item.slot}`;
      const existing = map.get(key) ?? [];
      existing.push(item);
      existing.sort((left, right) => left.slotIndex - right.slotIndex);
      map.set(key, existing);
    }

    return map;
  }, [week]);

  async function refreshCurrentWeek(message?: string) {
    await loadWeek(weekStart);
    if (message) {
      setStatusMessage(message);
    }
  }

  async function addRecipeToSlot(date: string, slot: MealSlot, recipeId: string) {
    const existingItems = itemsByDayAndSlot.get(`${date}::${slot}`) ?? [];
    const nextSlotIndex = existingItems.length ? Math.max(...existingItems.map((item) => item.slotIndex)) + 1 : 1;

    setSaving(true);
    setStatusMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/v1/planner/weeks/${weekStart}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          slot,
          slotIndex: nextSlotIndex,
          recipeId,
          servings: 1,
        }),
      });

      const data = (await response.json().catch(() => ({})) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? 'Unable to add the recipe to your planner.');
        return;
      }

      setActiveComposer(null);
      setRecipeQuery('');
      await refreshCurrentWeek(`${getSlotLabel(slot)} updated for ${date}.`);
    } catch {
      setError('Network error while saving planner changes.');
    } finally {
      setSaving(false);
    }
  }

  async function removePlannerItem(itemId: string) {
    setSaving(true);
    setStatusMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/v1/planner/items/${itemId}`, {
        method: 'DELETE',
      });

      const data = (await response.json().catch(() => ({})) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? 'Unable to remove the planner item.');
        return;
      }

      await refreshCurrentWeek('Planner item removed.');
    } catch {
      setError('Network error while removing planner item.');
    } finally {
      setSaving(false);
    }
  }

  function shiftWeek(days: number) {
    const next = addDays(new Date(weekStart), days);
    setWeekStart(formatDateInput(startOfWeek(next)));
    setActiveComposer(null);
    setRecipeQuery('');
    setStatusMessage(null);
  }

  const totalMeals = week?.items.length ?? 0;

  return (
    <div className="plannerLayout">
      <section className="panel">
        <div className="plannerHeaderRow">
          <div>
            <h2>Weekly calendar</h2>
            <p className="muted">
              Plan breakfast, lunch, dinner, and snacks for the week. Premium access stays enforced on the server.
            </p>
          </div>
          <div className="plannerWeekControls">
            <button type="button" onClick={() => shiftWeek(-7)}>
              Previous week
            </button>
            <button type="button" onClick={() => setWeekStart(formatDateInput(startOfWeek(new Date())))}>
              This week
            </button>
            <button type="button" onClick={() => shiftWeek(7)}>
              Next week
            </button>
          </div>
        </div>

        <p className="muted">Week of {weekStart}</p>

        {statusMessage ? <p className="statusMessage">{statusMessage}</p> : null}
        {error ? <p className="statusError">{error}</p> : null}

        {loadingWeek ? (
          <p>Loading planner week …</p>
        ) : (
          <div className="plannerGrid">
            {weekDates.map((date, index) => {
              const isoDate = formatDateInput(date);

              return (
                <article key={isoDate} className="plannerDayCard">
                  <div className="plannerDayHeader">
                    <h3>{formatDayHeading(date, index)}</h3>
                    <span className="badge">{isoDate}</span>
                  </div>

                  <div className="plannerSlots">
                    {MEAL_SLOTS.map((slot) => {
                      const slotItems = itemsByDayAndSlot.get(`${isoDate}::${slot}`) ?? [];
                      const isComposerOpen =
                        activeComposer?.date === isoDate && activeComposer?.slot === slot;

                      return (
                        <section key={${isoDate}-${slot}} className="plannerSlotCard">
                          <div className="plannerSlotHeader">
                            <strong>{getSlotLabel(slot)}</strong>
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() => {
                                setActiveComposer({ date: isoDate, slot });
                                setRecipeQuery('');
                              }}
                            >
                              {slotItems.length ? 'Add another' : 'Add meal'}
                            </button>
                          </div>

                          {slotItems.length ? (
                            <ul className="plannerItemList">
                              {slotItems.map((item) => (
                                <li key={item.id} className="plannerItemRow">
                                  <div>
                                    <strong>{item.recipe.title}</strong>
                                    <p className="muted">
                                      {item.servings} serving · slot #{item.slotIndex}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    disabled={saving}
                                    onClick={() => {
                                      void removePlannerItem(item.id);
                                    }}
                                  >
                                    Remove
                                  </button>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="muted">Nothing planned yet.</p>
                          )}

                          {isComposerOpen ? (
                            <div className="plannerComposer">
                              <label className="field">
                                <span>Find a recipe</span>
                                <input
                                  type="search"
                                  value={recipeQuery}
                                  onChange={(event) => setRecipeQuery(event.target.value)}
                                  placeholder={`Search ${slot} recipes`}
                                />
                              </label>

                              {loadingRecipes ? <p className="muted">Loading recipes…</p> : null}

                              <ul className="plannerRecipeResults">
                                {recipes.map((recipe) => (
                                  <li key={recipe.slug} className="plannerRecipeResult">
                                    <div>
                                      <strong>{recipe.title}</strong>
                                      <p className="muted">
                                        {recipe.nutrition.calories} kcal · {recipe.nutrition.protein}g protein
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      disabled={saving}
                                      onClick={() => {
                                        void addRecipeToSlot(isoDate, slot, recipe.slug);
                                      }}
                                    >
                                      Add
                                    </button>
                                  </li>
                                ))}
                              </ul>

                              {!loadingRecipes && !recipes.length ? (
                                <p className="muted">No recipes matched this slot yet.</p>
                              ) : null}
                            </div>
                          ) : null}
                        </section>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <div className="plannerSidebar">
        <section className="panel">
          <h2>Week summary</h2>
          <div className="plannerSummaryGrid">
            <div>
              <dt>Meals planned</dt>
              <dd>{totalMeals}</dd>
            </div>
            <div>
              <dt>Calories</dt>
              <dd>{week?.summary?.totals.calories ?? 0}</dd>
            </div>
            <div>
              <dt>Protein</dt>
              <dd>{week?.summary?.totals.protein_g ?? 0}g</dd>
            </div>
            <div>
              <dt>Fat</dt>
              <dd>{week/.summary?.totals.fat_g ?? 0}g</dd>
            </div>
            <div>
              <dt>Carbs</dt>
              <dd>{week?.summary?.totals.carbs_g ?? 0}g</dd>
            </div>
            <div>
              <dt>Coverage</dt>
              <dd>{week/.summary?.completeness.isPartial ? 'Partial' : 'Complete'}</dd>
            </div>
          </div>

          {week/.warnings?.length ? (
            <ul className="plannerWarnings">
              {week.warnings.map((warning, index) => (
                <li key={`${warning.itemId}-${warning.code}-${index}`}>{getWarningLabel(warning.code)}</li>
              ))}
            </ul>
          ) : (
            <p className="muted">No planner warnings for this week.</p>
          )}
        </section>

        <section className="panel">
          <div className="plannerSidebarHeader">
            <h2>Shopping list preview</h2>
            <Link href="/shopping-list">Open full shopping list</Link>
          </div>

          <p className="muted">
            Aggregated in {shoppingList?.unitSystem ?? 'metric'} units from your current planner week.
          </p>

          {shoppingList?.items?.length ? (
            <ul className="ingredientList">
              {shoppingList.items.slice(0, 8).map((item) => (
                <li key={item.ingredientKey}>
                  <strong>{item.displayName}</strong>
                  <span className="muted">
                    {item.quantity} {item.unit} £{'item.sourceCount} recipe{item.sourceCount > 1 ? 's' : ''}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="emptyState">
              <p>Add meals to your week to see an aggregated shopping list preview.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
