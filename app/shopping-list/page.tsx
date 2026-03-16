'use client';

import Link from 'next/link';
import {useEffect, useState, type FormEvent} from 'react';
import {withLocale} from '@/lib/locale-path';

type ManualItem = {
  id: string;
  text: string;
  pantry: boolean;
};

type PlannerShoppingItem = {
  ingredientKey: string;
  displayName: string;
  quantity: number;
  unit: string;
  sourceCount: number;
};

type PlannerShoppingList = {
  unitSystem: 'metric' | 'imperial' | string;
  items: PlannerShoppingItem[];
};

type ShoppingListPageProps = {
  params?: {locale?: string};
};

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

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function ShoppingListPage({params}: ShoppingListPageProps) {
  const locale = params?.locale;
  const [items, setItems] = useState<ManualItem[]>([]);
  const [text, setText] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [linkReady, setLinkReady] = useState(false);
  const [loading, setLoading] = useState(true);

  const [weekStart, setWeekStart] = useState(formatDate(startOfWeek(new Date())));
  const [plannerList, setPlannerList] = useState<PlannerShoppingList | null>(null);
  const [plannerLoading, setPlannerLoading] = useState(true);
  const [plannerError, setPlannerError] = useState<string | null>(null);
  const [plannerPremiumRequired, setPlannerPremiumRequired] = useState(false);
  const [plannerAuthenticated, setPlannerAuthenticated] = useState(true);

  async function load() {
    setErr(null);
    setLoading(true);
    const res = await fetch('/api/shopping-list');

    if (!res.ok) {
      setErr('Please log in to view your shopping list.');
      setItems([]);
      setLoading(false);
      return;
    }

    const data = await res.json();
    setItems(data.items || []);
    setLoading(false);
  }

  async function loadPlannerAggregation(targetWeekStart: string) {
    setPlannerLoading(true);
    setPlannerError(null);
    setPlannerPremiumRequired(false);
    setPlannerAuthenticated(true);

    try {
      const res = await fetch(
        `/api/v1/planner/weeks/${targetWeekStart}/shopping-list`,
        {cache: 'no-store'}
      );

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setPlannerList(data.shoppingList ?? null);
        return;
      }

      setPlannerList(null);

      if (res.status === 403) {
        setPlannerPremiumRequired(true);
        setPlannerError(
          'Upgrade to Premium to unlock planner-based shopping aggregation.'
        );
        return;
      }

      if (res.status === 401 || res.status === 404) {
        setPlannerAuthenticated(false);
        setPlannerError('Log in to review your planner-linked shopping list.');
        return;
      }

      setPlannerError(
        'Unable to load planner shopping aggregation for this week.'
      );
    } catch {
      setPlannerList(null);
      setPlannerError(
        'Network error while loading planner shopping aggregation.'
      );
    } finally {
      setPlannerLoading(false);
    }
  }

  useEffect(() => {
    setLinkReady(true);
    void load();
  }, []);

  useEffect(() => {
    void loadPlannerAggregation(weekStart);
  }, [weekStart]);

  async function addItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const res = await fetch('/api/shopping-list', {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({text}),
    });

    if (!res.ok) {
      setErr('Failed to add item (are you logged in?).');
      return;
    }

    setText('');
    await load();
  }

  async function toggle(item: ManualItem) {
    await fetch('/api/shopping-list', {
      method: 'PATCH',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({id: item.id, pantry: !item.pantry}),
    });

    await load();
  }

  async function remove(item: ManualItem) {
    await fetch('/api/shopping-list', {
      method: 'DELETE',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({id: item.id}),
    });

    await load();
  }

  function movePlannerWeek(days: number) {
    setWeekStart((current) =>
      formatDate(startOfWeek(addDays(new Date(current), days)))
    );
  }

  const pantryCount = items.filter((item) => item.pantry).length;
  const plannerItemCount = plannerList?.items?.length ?? 0;

  return (
    <div className="recipesPage">
      <div className="pageIntro">
        <h1>Shopping list</h1>
        <p>
          Add ingredients manually or review the planner-linked weekly aggregation.
          Unit continuity stays aligned with your current preferences where planner
          aggregation is available.
        </p>
      </div>

      <section className="panel">
        <div className="plannerSidebarHeader">
          <div>
            <h2>Planner week aggregation</h2>
            <p className="muted">Week of {weekStart}</p>
          </div>
          <div className="filterActions">
            <button type="button" onClick={() => movePlannerWeek(-7)}>
              Previous week
            </button>
            <button
              type="button"
              onClick={() => setWeekStart(formatDate(startOfWeek(new Date())))}
            >
              This week
            </button>
            <button type="button" onClick={() => movePlannerWeek(7)}>
              Next week
            </button>
          </div>
        </div>

        {plannerLoading ? <p>Loading planner shopping aggregation...</p> : null}
        {plannerError ? <p className="statusError">{plannerError}</p> : null}

        {plannerList ? (
          <>
            <p className="resultsMeta">
              {plannerItemCount} aggregated item{plannerItemCount === 1 ? '' : 's'} -
              unit system: {plannerList.unitSystem || 'metric'}
            </p>
            {plannerList.items.length ? (
              <ul className="ingredientList">
                {plannerList.items.map((item) => (
                  <li key={item.ingredientKey}>
                    <strong>{item.displayName}</strong>
                    <span className="muted">
                      {item.quantity} {item.unit} - {item.sourceCount} recipe
                      {item.sourceCount === 1 ? '' : 's'}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="emptyState">
                <p>
                  No planner meals for this week yet. Add meals in the planner to see
                  aggregated ingredients.
                </p>
                <div className="filterActions">
                  <Link href={withLocale(locale, '/planner')}>Open planner</Link>
                </div>
              </div>
            )}
          </>
        ) : null}

        {!plannerLoading && plannerPremiumRequired ? (
          <div className="filterActions">
            <Link href={withLocale(locale, '/account')}>Upgrade to Premium</Link>
            <Link href={withLocale(locale, '/planner')}>Review planner</Link>
          </div>
        ) : null}

        {!plannerLoading && !plannerAuthenticated ? (
          <div className="filterActions">
            <Link href={withLocale(locale, '/account/login')}>Log in</Link>
            <Link href={withLocale(locale, '/account/register')}>
              Create an account
            </Link>
          </div>
        ) : null}
      </section>

      {err ? (
        <div className="emptyState">
          <p>{err}</p>
          {linkReady ? (
            <p>
              <Link href={withLocale(locale, '/account/login')}>Log in</Link> or{' '}
              <Link href={withLocale(locale, '/account/register')}>
                create an account
              </Link>{' '}
              to save your shopping list.
            </p>
          ) : null}
        </div>
      ) : (
        <>
          <form onSubmit={addItem} className="recipesFilters">
            <label className="field fieldWide">
              <span>Add item</span>
              <input
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Avocado"
              />
            </label>
            <div className="filterActions">
              <button type="submit">Add item</button>
            </div>
          </form>

          <p className="resultsMeta">
            {loading
              ? 'Loading shopping list...'
              : `${items.length} item${items.length === 1 ? '' : 's'} - ${pantryCount} at home`}
          </p>

          {items.length ? (
            <ul className="recipeGrid">
              {items.map((item) => (
                <li key={item.id} className="recipeCard">
                  <div className="recipeCardHeader">
                    <p className="badge">
                      {item.pantry ? 'In pantry' : 'Need to buy'}
                    </p>
                  </div>
                  <p>{item.text}</p>
                  <div className="filterActions">
                    <button type="button" onClick={() => toggle(item)}>
                      {item.pantry ? 'Mark as need to buy' : 'Mark as at home'}
                    </button>
                    <button type="button" onClick={() => remove(item)}>
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="emptyState">
              <h2>Your shopping list is empty</h2>
              <p>
                Add items manually or use "Add ingredients to shopping list" from a
                recipe.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
