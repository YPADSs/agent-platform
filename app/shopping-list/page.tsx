'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Item = { id: string; text: string; pantry: boolean };

export default function ShoppingListPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [text, setText] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [linkReady, setLinkReady] = useState(false);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    setLinkReady(true);
    load();
  }, []);

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/shopping-list', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      setErr('Failed to add item (are you logged in?).');
      return;
    }
    setText('');
    await load();
  }

  async function toggle(item: Item) {
    await fetch('/api/shopping-list', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: item.id, pantry: !item.pantry }),
    });
    await load();
  }

  async function remove(item: Item) {
    await fetch('/api/shopping-list', {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: item.id }),
    });
    await load();
  }

  const pantryCount = items.filter((item) => item.pantry).length;

  return (
    <div className="recipesPage">
      <div className="pageIntro">
        <h1>Shopping list</h1>
        <p>Add ingredients from recipes or type items manually. Mark items as already at home with the pantry toggle.</p>
      </div>

      {err ? (
        <div className="emptyState">
          <p>{err}</p>
          {linkReady ? (
            <p>
              <Link href="/account/login">Log in</Link> {' '}or <Link href="/account/register">create an account</Link>
              to save your shopping list.
            </p>
          ) : null}
        </div>
      ) : (
        <>
          <form onSubmit={addItem} className="recipesFilters">
            <label className="field fieldWide">
              <span>Add item</span>
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Avocado" />
            </label>
            <div className="filterActions">
              <button type="submit">Add item</button>
            </div>
          </form>

          <p className="resultsMeta">
            {loading ? 'Loading shopping list...' : `${items.length} item${items.length === 1 ? '' : 's'} • ${pantryCount} at home`}
          </p>

          {items.length ? (
            <ul className="recipeGrid">
              {items.map((item) => (
                <li key={item.id} className="recipeCard">
                  <div className="recipeCardHeader">
                    <p className="badg">{item.pantry ? 'In pantry' : 'Need to buy'}</p>
                  </div>
                  <p>{item.text}</p>
                  <div className="filterActions">
                    <button type="button" onClick={() => toggle(item)}>
                      {item.pantry ? "Mark as need  to buy" : "Mark as at home"}
                    </button>
                    <button type="button" onClick={() => remove(item)}>Remove</button>
                  </div>
                </li>
             "))}
            </ul>
          ) : (
            <div className="emptyState">
              <h2>Your shopping list is empty</h2>
              <p>Add items manually or use “Add ingredients to shopping list” from a recipe.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
