'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { track } from '@/lib/analytics';

type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack';

type WeekItem = {
  id: string;
  date: string;
  slot: MealSlot;
  slotIndex: number;
  servings: number;
  recipe: {
    id: string;
    slug: string;
    title: string;
  };
};

type PlannerWeek = {
  weekStart: string;
  items: WeekItem[];
  summary: {
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
  warnings: Array<{ code: string; itemId: string }>;
};

type PlannerShoppingList = {
  unitSystem: string;
  items: Array<{
    ingredientKey: string;
    displayName: string;
    quantity: number;
    unit: string;
    sourceCount: number;
  }>;
};

type PlannerRecipeResult = {
  id: string;
  slug: string;
  title: string;
  mealType: string;
  description: string;
};

type AutoplanPlan = {
  weekStart: string;
  items: Array<{
    date: string;
    slot: MealSlot;
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
  }>;
  summary: {
    days: number;
    items: number;
    pantryMatches: number;
  };
};

const SLOT_LABELS: Record<MealSlot, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function parseDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

function startOfWeek(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  return copy;
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function payloadError(payload: any, fallback: string): string {
  return typeof payload?.error === 'string' ? payload.error : fallback;
}

function warningLabel(code: string): string {
  if (code === 'MISSING_NUTRITION') return 'Some recipe nutrition is unavailable.';
  if (code === 'RECIPE_UNAVAILABLE') return 'A planned recipe is no longer available.';
  if (code === 'UNSUPPORTED_UNIT_CONVERSION') return 'Some units were not converted automatically.';
  return 'Planner warning.';
}

export default function PlannerCalendar() {
  const [weekStart, setWeekStart] = useState(formatDate(startOfWeek(new Date())));
  const [week, setWeek] = useState<PlannerWeek | null>(null);
  const [shoppingList, setShoppingList] = useState<PlannerShoppingList | null>(null);
  const [recipes, setRecipes] = useState<PlannerRecipeResult[]>([]);
  const [loadingWeek, setLoadingWeek] = useState(true);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [saving, setSaving] = useState(false);
  const [composer, setComposer] = useState<{ date: string; slot: MealSlot } | null>(null);
  const [recipeQuery, setRecipeQuery] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [autoplan, setAutoplan] = useState<AutoplanPlan | null>(null);
  const [autoplanLoading, setAutoplanLoading] = useState(false);
  const [autoplanApplying, setAutoplanApplying] = useState(false);

  async function loadWeek(targetWeekStart: string) {
    setLoadingWeek(true);
    setError(null);

    try {
      const [weekResponse, shoppingResponse] = await Promise.all([
        fetch(`/api/v1/planner/weeks/${targetWeekStart}`, { cache: 'no-store' }),
        fetch(`/api/v1/planner/weeks/${targetWeekStart}/shopping-list`, { cache: 'no-store' }),
      ]);

      const weekPayload = await weekResponse.json().catch(() => ({}));
      const shoppingPayload = await shoppingResponse.json().catch(() => ({}));

      if (!weekResponse.ok) {
        setError(payloadError(weekPayload, 'Unable to load this planner week.'));
        return;
      }

      if (!shoppingResponse.ok) {
        setError(payloadError(shoppingPayload, 'Unable to load the planner shopping list.'));
        return;
      }

      setWeek(weekPayload.week ?? null);
      setShoppingList(shoppingPayload.shoppingList ?? null);
    } catch {
      setError('Network error while loading planner data.');
    } finally {
      setLoadingWeek(false);
    }
  }

  useEffect(() => {
    void loadWeek(weekStart);
  }, [weekStart]);

  useEffect(() => {
    if (!composer) {
      setRecipes([]);
      return;
    }

    const currentComposer = composer;

    async function run() {
      setLoadingRecipes(true);

      try {
        const params = new URLSearchParams({ slot: currentComposer.slot });
        const trimmedQuery = recipeQuery.trim();

        if (trimmedQuery) {
          params.set('q', trimmedQuery);
        }

        const response = await fetch(`/api/v1/planner/recipes?${params.toString()}`, {
          cache: 'no-store',
        });

        const payload = await response.json().catch(() => ({}));
        setRecipes(response.ok && Array.isArray(payload.recipes) ? payload.recipes : []);

        if (trimmedQuery) {
          void track({
            name: 'planner_recipe_search',
            ts: Date.now(),
            props: {
              surface: 'planner',
              slot: currentComposer.slot,
              weekStart,
              hasQuery: true,
              queryLength: trimmedQuery.length,
            },
          });
        }
      } catch {
        setRecipes([]);
      } finally {
        setLoadingRecipes(false);
      }
    }

    void run();
  }, [composer, recipeQuery, weekStart]);

  const weekDates = useMemo(() => {
    const start = startOfWeek(parseDate(weekStart));
    return Array.from({ length: 7 }, (_, index) => addDays(start, index));
  }, [weekStart]);

  const itemsBySlot = useMemo(() => {
    const map = new Map<string, WeekItem[]>();

    for (const item of week?.items ?? []) {
      const key = `${item.date.slice(0, 10)}::${item.slot}`;
      const items = map.get(key) ?? [];
      items.push(item);
      items.sort((left, right) => left.slotIndex - right.slotIndex);
      map.set(key, items);
    }

    return map;
  }, [week]);

  async function refreshWeek(message?: string) {
    await loadWeek(weekStart);
    if (message) {
      setStatusMessage(message);
    }
  }

  async function addRecipe(date: string, slot: MealSlot, recipeId: string) {
    const slotItems = itemsBySlot.get(`${date}::${slot}`) ?? [];
    const nextSlotIndex = slotItems.length
      ? Math.max(...slotItems.map((item) => item.slotIndex)) + 1
      : 1;

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

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payloadError(payload, 'Unable to add the recipe to your planner.'));
        return;
      }

      setComposer(null);
      setRecipeQuery('');
      await refreshWeek(`${SLOT_LABELS[slot]} updated for ${date}.`);
      void track({
        name: 'planner_item_added',
        ts: Date.now(),
        props: {
          surface: 'planner',
          weekStart,
          date,
          slot,
        },
      });
    } catch {
      setError('Network error while saving planner changes.');
    } finally {
      setSaving(false);
    }
  }

  async function removeItem(itemId: string, slot?: MealSlot) {
    setSaving(true);
    setStatusMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/v1/planner/items/${itemId}`, {
        method: 'DELETE',
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payloadError(payload, 'Unable to remove the planner item.'));
        return;
      }

      await refreshWeek('Planner item removed.');
      void track({
        name: 'planner_item_removed',
        ts: Date.now(),
        props: {
          surface: 'planner',
          weekStart,
          slot,
        },
      });
    } catch {
      setError('Network error while removing planner item.');
    } finally {
      setSaving(false);
    }
  }

  async function generateAutoplan() {
    setAutoplanLoading(true);
    setStatusMessage(null);
    setError(null);

    try {
      const response = await fetch('/api/v1/planner/autoplan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekStart }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payloadError(payload, 'Unable to generate an automatic plan.'));
        return;
      }

      setAutoplan(payload.plan ?? null);
      void track({
        name: 'planner_autoplan_generated',
        ts: Date.now(),
        props: { surface: 'planner', weekStart },
      });
    } catch {
      setError('Network error while generating an automatic plan.');
    } finally {
      setAutoplanLoading(false);
    }
  }

  async function applyAutoplan() {
    if (!autoplan?.items.length) {
      return;
    }

    setAutoplanApplying(true);
    setStatusMessage(null);
    setError(null);

    try {
      const response = await fetch('/api/v1/planner/autoplan/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekStart,
          items: autoplan.items.map((item) => ({
            date: item.date,
            slot: item.slot,
            slotIndex: item.slotIndex,
            recipeId: item.recipe.id,
            servings: item.servings,
          })),
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payloadError(payload, 'Unable to apply the automatic plan.'));
        return;
      }

      setAutoplan(null);
      await refreshWeek(`Automatic plan applied (${payload.appliedCount ?? 0} items).`);
      void track({
        name: 'planner_autoplan_applied',
        ts: Date.now(),
        props: { surface: 'planner', weekStart },
      });
    } catch {
      setError('Network error while applying an automatic plan.');
    } finally {
      setAutoplanApplying(false);
    }
  }

  function moveWeek(days: number) {
    const nextWeekStart = formatDate(startOfWeek(addDays(parseDate(weekStart), days)));
    setWeekStart(nextWeekStart);
    setComposer(null);
    setRecipeQuery('');
    setAutoplan(null);
    setStatusMessage(null);
    void track({
      name: 'planner_week_changed',
      ts: Date.now(),
      props: {
        surface: 'planner',
        fromWeekStart: weekStart,
        toWeekStart: nextWeekStart,
        direction: days < 0 ? 'previous' : 'next',
      },
    });
  }

  return (
    <div className="plannerLayout">
      <section className="panel">
        <div className="plannerHeaderRow">
          <div>
            <h2>Weekly calendar</h2>
            <p className="muted">
              Plan breakfast, lunch, dinner, and snacks across the week. Premium gating
              remains enforced on the server.
            </p>
          </div>
          <div className="plannerWeekControls">
            <button type="button" onClick={() => moveWeek(-7)}>
              Previous week
            </button>
            <button type="button" onClick={() => setWeekStart(formatDate(startOfWeek(new Date())))}>
              This week
            </button>
            <button type="button" onClick={() => moveWeek(7)}>
              Next week
            </button>
          </div>
        </div>

        <p className="muted">Week of {weekStart}</p>
        {statusMessage ? <p className="statusMessage">{statusMessage}</p> : null}
        {error ? <p className="statusError">{error}</p> : null}

        {loadingWeek ? (
          <p>Loading planner week...</p>
        ) : (
          <div className="plannerGrid">
            {weekDates.map((date, index) => {
              const iso = formatDate(date);

              return (
                <article key={iso} className="plannerDayCard">
                  <div className="plannerDayHeader">
                    <h3>
                      {DAY_LABELS[index]} {date.getDate()}
                    </h3>
                    <span className="badge">{iso}</span>
                  </div>

                  <div className="plannerSlots">
                    {(Object.keys(SLOT_LABELS) as MealSlot[]).map((slot) => {
                      const slotItems = itemsBySlot.get(`${iso}::${slot}`) ?? [];
                      const composerOpen = composer?.date === iso && composer?.slot === slot;

                      return (
                        <section key={`${iso}-${slot}`} className="plannerSlotCard">
                          <div className="plannerSlotHeader">
                            <strong>{SLOT_LABELS[slot]}</strong>
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() => {
                                setComposer({ date: iso, slot });
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
                                    <p className="muted">{item.servings} serving(s)</p>
                                  </div>
                                  <button type="button" disabled={saving} onClick={() => removeItem(item.id, slot)}>
                                    Remove
                                  </button>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="muted">No meal yet.</p>
                          )}

                          {composerOpen ? (
                            <div className="plannerComposer">
                              <label className="field fieldWide">
                                <span>Search recipes</span>
                                <input
                                  value={recipeQuery}
                                  onChange={(event) => setRecipeQuery(event.target.value)}
                                  placeholder={`Search ${slot} recipes`}
                                />
                              </label>

                              {loadingRecipes ? <p>Loading recipes...</p> : null}

                              <ul className="plannerRecipeResults">
                                {recipes.map((recipe) => (
                                  <li key={recipe.id} className="plannerRecipeResult">
                                    <div>
                                      <strong>{recipe.title}</strong>
                                      <p className="muted">{recipe.description}</p>
                                    </div>
                                    <button type="button" disabled={saving} onClick={() => addRecipe(iso, slot, recipe.id)}>
                                      Add
                                    </button>
                                  </li>
                                ))}
                              </ul>

                              {!loadingRecipes && !recipes.length ? (
                                <p className="muted">No recipe suggestions yet.</p>
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

      <aside className="plannerSidebar">
        <section className="panel">
          <h2>Week summary</h2>
          {week ? (
            <>
              <dl className="plannerSummaryGrid">
                <div>
                  <dt>Calories</dt>
                  <dd>{week.summary.totals.calories}</dd>
                </div>
                <div>
                  <dt>Protein</dt>
                  <dd>{week.summary.totals.protein_g}g</dd>
                </div>
                <div>
                  <dt>Fat</dt>
                  <dd>{week.summary.totals.fat_g}g</dd>
                </div>
                <div>
                  <dt>Carbs</dt>
                  <dd>{week.summary.totals.carbs_g}g</dd>
                </div>
              </dl>
              {week.warnings.length ? (
                <div className="plannerWarnings">
                  {week.warnings.map((warning) => (
                    <p key={`${warning.itemId}-${warning.code}`} className="statusError">
                      {warningLabel(warning.code)}
                    </p>
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <p className="muted">No summary available yet.</p>
          )}
        </section>

        <section className="panel">
          <h2>Autoplan</h2>
          <p className="muted">
            Generate a first-pass weekly structure using your catalog and pantry signal.
          </p>
          <div className="filterActions">
            <button type="button" onClick={generateAutoplan} disabled={autoplanLoading}>
              {autoplanLoading ? 'Generating...' : 'Generate autoplan'}
            </button>
            {autoplan ? (
              <button type="button" onClick={applyAutoplan} disabled={autoplanApplying}>
                {autoplanApplying ? 'Applying...' : 'Apply autoplan'}
              </button>
            ) : null}
          </div>

          {autoplan ? (
            <>
              <p className="resultsMeta">
                {autoplan.summary.items} items • {autoplan.summary.pantryMatches} pantry-aware picks
              </p>
              <ul className="plannerItemList">
                {autoplan.items.slice(0, 8).map((item) => (
                  <li key={`${item.date}-${item.slot}-${item.recipe.slug}`} className="plannerItemRow">
                    <div>
                      <strong>
                        {item.date} • {SLOT_LABELS[item.slot]}
                      </strong>
                      <p>{item.recipe.title}</p>
                      <p className="muted">{item.reason}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="muted">Generate an autoplan to preview recommended meals for the week.</p>
          )}
        </section>

        <section className="panel">
          <h2>Shopping impact</h2>
          {shoppingList ? (
            <>
              <p className="resultsMeta">
                {shoppingList.items.length} aggregated item{shoppingList.items.length === 1 ? '' : 's'} • {shoppingList.unitSystem}
              </p>
              <ul className="ingredientList">
                {shoppingList.items.slice(0, 8).map((item) => (
                  <li key={item.ingredientKey}>
                    <strong>{item.displayName}</strong>
                    <span className="muted">
                      {item.quantity} {item.unit} • {item.sourceCount} recipe
                      {item.sourceCount === 1 ? '' : 's'}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="filterActions">
                <Link href="/shopping-list" className="buttonGhost">
                  Open shopping list
                </Link>
              </div>
            </>
          ) : (
            <p className="muted">No aggregated shopping data available yet.</p>
          )}
        </section>
      </aside>
    </div>
  );
}
