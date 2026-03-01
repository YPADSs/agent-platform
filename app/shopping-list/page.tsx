'use client';

import { useEffect, useState } from 'react';

type Item = { id: string; text: string; checked: boolean };

export default function ShoppingListPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [text, setText] = useState('');
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    const res = await fetch('/api/shopping-list');
    if (!res.ok) {
      setErr('Please login to view your shopping list.');
      return;
    }
    const data = await res.json();
    setItems(data.items || []);
  }

  useEffect(() => {
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
      body: JSON.stringify({ id: item.id, checked: !item.checked }),
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

  return (
    <>
      <h1>Shopping list</h1>
      {err && <p>{err}</p>}

      <form onSubmit={addItem}>
        <label>
          Item:{' '}
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Avocado" />
        </label>{' '}
        <button type="submit">Add</button>
      </form>

      <ul>
        {items.map((i) => (
          <li key={i.id}>
            <label>
              <input type="checkbox" checked={i.checked} onChange={() => toggle(i)} /> {i.text}
            </label>{' '}
            <button onClick={() => remove(i)}>Remove</button>
          </li>
        ))}
      </ul>
    </>
  );
}
