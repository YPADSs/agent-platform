'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { withLocale } from '@/lib/locale-path';

type PantryItem = {
  id: string;
  ingredientKey: string;
  defaultName: string;
  displayName: string;
  quantity: number | null;
  unit: string | null;
  note: string | null;
  updatedAt: string;
};

export default function PantryPage() {
  const params = useParams<{ locale?: string }>();
  const locale = typeof params?.locale === 'string' ? params.locale : undefined;
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    setErr(null);
    setLoading(true);

    const res = await fetch('/api/v1/me/pantry', { cache: 'no-store' });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setItems([]);
      setErr(data.error === 'UNAUTHENTICATED' ? 'Please log in to manage your pantry.' : 'Unable to load pantry right now.');
      setLoading(false);
      return;
    }

    setItems(data.items || []);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function addItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setErr(null);

    const res = await fetch('/api/v1/me/pantry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        quantity: quantity.trim() ? Number(quantity) : null,
        unit: unit.trim() || null,
        note: note.trim() || null,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setErr(data.error === 'DUPLICATE_PANTRY_ITEM' ? 'This ingredient is already in your pantry.' : data.error ?? 'Unable to add pantry item.');
      setSaving(false);
      return;
    }

    setName('');
    setQuantity('');
    setUnit('');
    setNote('');
    setSaving(false);
    await load();
  }

  async function markSeenToday(item: PantryItem) {
    await fetch(`/api/v1/me/pantry/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lastConfirmedAt: new Date().toISOString() }),
    });
    await load();
  }

  async function removeItem(item: PantryItem) {
    await fetch(`/api/v1/me/pantry/${item.id}`, { method: 'DELETE' });
    await load();
  }

  return (
    <div className="recipesPage">
      <div className="pageIntro">
        <h1>Pantry</h1>
        <p>Track the ingredients you already have at home so later V2 flows can reuse a normalized source of truth.</p>
      </div>

      {err ? (
        <div className="emptyState">
          <p>{err}</p>
          {err.includes('log in') ? (
            <div className="filterActions">
              <Link href={withLocale(locale, '/account/login')}>Log in</Link>
              <Link href={withLocale(locale, '/account/register')}>Create an account</Link>
            </div>
          ) : null}
        </div>
      ) : (
        <>
          <form className="recipesFilters" onSubmit={addItem}>
            <label className="field">
              <span>Ingredient</span>
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Chickpeas" required />
            </label>
            <label className="field">
              <span>Quantity</span>
              <input value={quantity} onChange={(event) => setQuantity(event.target.value)} placeholder="2" />
            </label>
            <label className="field">
              <span>Unit</span>
              <input value={unit} onChange={(event) => setUnit(event.target.value)} placeholder="can" />
            </label>
            <label className="field fieldWide">
              <span>Note</span>
              <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Low stock left" />
            </label>
            <div className="filterActions">
              <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Add to pantry'}</button>
            </div>
          </form>

          <p className="resultsMeta">{loading ? 'Loading pantry...' : `${items.length} item${items.length === 1 ? '' : 's'}`}</p>

          {items.length ? (
            <ul className="recipeGrid">
              {items.map((item) => (
                <li key={item.id} className="recipeCard">
                  <div className="recipeCardHeader">
                    <p className="badge">{item.ingredientKey}</p>
                    <p className="muted">Updated {new Date(item.updatedAt).toLocaleDateString()}</p>
                  </div>
                  <h2>{item.displayName}</h2>
                  <p>{item.quantity !== null ? `${item.quantity} ${item.unit ?? ''}`.trim() : 'No quantity yet.'}</p>
                  {item.note ? <p className="muted">{item.note}</p> : null}
                  <div className="filterActions">
                    <button type="button" onClick={() => markSeenToday(item)}>Mark as seen today</button>
                    <button type="button" onClick={() => removeItem(item)}>Remove</button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="emptyState">
              <h2>Your pantry is empty</h2>
              <p>Add a few key ingredients you already have at home to start the V2 foundation.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
