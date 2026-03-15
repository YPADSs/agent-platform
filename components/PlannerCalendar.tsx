
'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack';

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
  if (code === 'UNSUPPORTED_UNIT_CONVERSION') return 'Some shopping list units stayed unchanged to avoid unsafe conversion.';
  return 'Planner warning.';
}

export default function PlannerCalendar() {
  const [weekStart, setWeekStart] = useState(formatDate(startOfWeek(new Date())));
  const [week, setWeek] = useState<any>(null);
  const [shoppingList, setShoppingList] = useState<any>(null);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loadingWeek, setLoadingWeek] = useState(true);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [saving, setSaving] = useState(false);
  const [composer, setComposer] = useState<{ date: string; slot: MealSlot } | null>(null);
  const [recipeQuery, setRecipeQuery] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  async function loadRecipes(slot: MealSlot, query: string) {
    setLoadingRecipes(true);

    try {
      const params = new URLSearchParams({ slot });
      if (query.trim()) params.set('q', query.trim());

      const response = await fetch(`/api/v1/planner/recipes?${params.toString()}`, {
        cache: 'no-store',
      });

      const payload = await response.json().catch(() => ({}));
      setRecipes(response.ok && Array.isArray(payload.recipes) ? payload.recipes : []);
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
    if (!composer) {
      setRecipes([]);
      return;
    }

    void loadRecipes(composer.slot, recipeQuery);
  }, [composer, recipeQuery]);

  const weekDates = useMemo(() => {
    const start = startOfWeek(parseDate(weekStart));
    return Array.from({ length: 7 }, (_, index) => addDays(start, index));
  }, [weekStart]);

  const itemsBySlot = useMemo(() => {
    const map = new Map<string, any[]>();

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
    if (message) setStatusMessage(message);
  }

  async function addRecipe(date: string, slot: MealSlot, recipeId: string) {
    const slotItems = itemsBySlot.get(`${date}::${slot}`) ?? [];
    const nextSlotIndex = slotItems.length ? Math.max(...slotItems.map((item) => item.slotIndex)) + 1 : 1;

    setSaving(true);
    setStatusMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/v1/planner/weeks/${weekStart}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, slot, slotIndex: nextSlotIndex, recipeId, servings: 1 }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payloadError(payload, 'Unable to add the recipe to your planner.'));
        return;
      }

      setComposer(null);
      setRecipeQuery('');
      await refreshWeek(`${SLOT_LABELS[slot]} updated for ${date}.`);
    } catch {
      setError('Network error while saving planner changes.');
    } finally {
      setSaving(false);
    }
  }

  async function removeItem(itemId: string) {
    setSaving(true);
    setStatusMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/v1/planner/items/${itemId}`, { method: 'DELETE' });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(payloadError(payload, 'Unable to remove the planner item.'));
        return;
      }

      await refreshWeek('Planner item removed.');
    } catch {
      setError('Network error while removing planner item.');
    } finally {
      setSaving(false);
    }
  }

  function moveWeek(days: number) {
    setWeekStart(formatDate(startOfWeek(addDays(parseDate(weekStart), days))));
    setComposer(null);
    setRecipeQuery('');
    setStatusMessage(null);
  }

  return (
    <div className="plannerLayout">
      <section className="panel">
        <div className="plannerHeaderRow">
          <div>
            <h2>Weekly calendar</h2>
            <p className="muted">
              Plan breakfast, lunch, dinner, and snacks for the week. Premium protection stays enforced on the server.
            </p>
          </div>
          <div className="plannerWeekControls">
            <button type="button" onClick={() => moveWeek(-7)}>Previous week</button>
            <button type="button" onClick={() => setWeekStart(formatDate(startOfWeek(new Date())))}>This week</button>
            <button type="button" onClick={() => moveWeek(7)}>Next week</button>
          </div>
        </div>

        <p className="muted">Week of {weekStart}</p>
        {statusMessage ? <p className="statusMessage">{statusMessage}</p> : null}
        {error ? <p className="statusError">{error}</p> : null}

        {loadingWeek ? (
          <p>Loading planner week…</p>
        ) : (
          <div className="plannerGrid">
            {weekDates.map((date, index) => {
              const isoDate = formatDate(date);

              return (
                <article key={isoDate} className="plannerDayCard">
                  <div className="plannerDayHeader">
                    <h3>{DAY_LABELS[index]} {date.getDate()}</h3>
                    <span className="badge">{isoDate}</span>
                  </div>

                  <div className="plannerSlots">
                    {(Object.keys(SLOT_LABELS) as MealSlot[]).map((slot) => {
                      const slotItems = itemsBySlot.get(`${isoDate}::${slot}`) ?? [];
                      const composerOpen = composer?.date === isoDate && composer?.slot === slot;

                      return (
                        <section key={`${isoDate}-${slot}`} className="plannerSlotCard">
                          <div className="plannerSlotHeader">
                            <strong>{SLOT_LABELS[slot]}</strong>
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() => {
                                setComposer({ date: isoDate, slot });
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
                                      {item.servings} serving{item.servings > 1 ? 's' : ''} · slot #{item.slotIndex}
                                    </p>
                                  </div>
                                  <button type="button" disabled={saving} onClick={() => void removeItem(item.id)}>
                                    Remove
                                  </button>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="muted">Nothing planned yet.</p>
                          )}

                          {composerOpen ? (
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
                                  <li key={recipe.id} className="plannerRecipeResult">
                                    <div>
                                      <strong>{recipe.title}</strong>
                                      <p className="muted">{recipe.slug}</p>
                                    </div>
                                    <button type="button" disabled={saving} onClick={() => void addRecipe(isoDate, slot, recipe.id)}>
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
          <dl className="plannerSummaryGrid">
            <div><dt>Meals planned</dt><dd>{week?.items?.length ?? 0}</dd></div>
            <div><dt>Calories</dt><dd>{week?.summary?.totals?.calories ?? 0}</dd></div>
            <div><dt>Protein</dt><dd>{week?.summary?.totals?.protein_g ?? 0}g</dd></div>
            <div><dt>Fat</dt><dd>{week?.summary?.totals?.fat_g ?? 0}g</dd></div>
            <div><dt>Carbs</dt><dd>{week?.summary?.totals?.carbs_g ?? 0}g</dd></div>
            <div><dt>Coverage</dt><dd>{week?.summary?.completeness?.isPartial ? 'Partial' : 'Complete'}</dd></div>
          </dl>

          {week?.warnings?.length ? (
            <ul className="plannerWarnings">
              {week.warnings.map((warning: any, index: number) => (
                <li key={`${warning.itemId}-${warning.code}-${index}`}>{warningLabel(warning.code)}</li>
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
              {shoppingList.items.slice(0, 8).map((item: any) => (
                <li key={item.ingredientKey}>
                  <strong>{item.displayName}</strong>
                  <span className="muted">
                    {item.quantity} {item.unit} · {item.sourceCount} recipe{item.sourceCount > 1 ? 's' : ''}
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
