'use client';

import { useEffect, useState } from 'react';

type Favorite = { targetType: 'RECIPE' | 'ARTICLE'; targetSlug: string };

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [targetType, setTargetType] = useState<'RECIPE' | 'ARTICLE'>('RECIPE');
  const [targetSlug, setTargetSlug] = useState('');

  async function load() {
    setErr(null);
    const res = await fetch('/api/favorites');
    if (!res.ok) {
      setErr('Please login to view favorites.');
      return;
    }
    const data = await res.json();
    setFavorites(data.favorites || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function addFavorite(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ targetType, targetSlug }),
    });
    if (!res.ok) {
      setErr('Failed to add favorite (are you logged in?).');
      return;
    }
    setTargetSlug('');
    await load();
  }

  async function removeFavorite(f: Favorite) {
    await fetch('/api/favorites', {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(f),
    });
    await load();
  }

  return (
    <>
      <h1>Favorites</h1>
      {err && <p>{err}</p>}

      <form onSubmit={addFavorite}>
        <label>
          Type:{' '}
          <select value={targetType} onChange={(e) => setTargetType(e.target.value as any)}>
            <option value="RECIPE">Recipe</option>
            <option value="ARTICLE">Article</option>
          </select>
        </label>{' '}
        <label>
          Slug:{' '}
          <input value={targetSlug} onChange={(e) => setTargetSlug(e.target.value)} placeholder="sample-recipe" />
        </label>{' '}
        <button type="submit">Add</button>
      </form>

      <ul>
        {favorites.map((f) => (
          <li key={`${f.targetType}:${f.targetSlug}`}>
            {f.targetType}: {f.targetSlug}{' '}
            <button onClick={() => removeFavorite(f)}>Remove</button>
          </li>
        ))}
      </ul>
    </>
  );
}
