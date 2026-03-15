'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { withLocale } from '@/lib/locale-path';

type Favorite = {
  targetType: 'RECIPE' | 'ARTICLE';
  targetSlug: string;
  target?: {
    type: 'RECIPE' | 'ARTICLE';
    slug: string;
    title: string;
    description: string;
    href: string;
  } | null;
};

function getLocalizedHref(locale: string | undefined, href: string | undefined) {
  if (!href) return undefined;
  if (!locale) return href;
  if (!href.startsWith('/')) return href;
  if (href === `/${locale}` || href.startsWith(`/${locale}/`)) {
    return href;
  }
  return withLocale(locale, href);
}

export default function FavoritesPage() {
  const params = useParams<{ locale?: string }>();
  const locale = typeof params?.locale === "string" ? params.locale : undefined;
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [linkReady, setLinkReady] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    setErr(null);
    setLoading(true);
    const res = await fetch('/api/favorites');
    if (!res.ok) {
      setErr('Please log in to view favorites.');
      setFavorites([]);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setFavorites(data.favorites || []);
    setLoading(false);
  }

  useEffect(() => {
    setLinkReady(true);
    load();
  }, []);

  async function removeFavorite(f: Favorite) {
    await fetch('/api/favorites', {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ targetType: f.targetType, targetSlug: f.targetSlug }),
    });
    await load();
  }

  return (
    <div className="recipesPage">
      <div className="pageIntro">
        <h1>Favorites</h1>
        <p>Saved recipes and articles show up there for quick revisits.</p>
      </div>

      {err ? (
        <div className="emptyState">
          <p>{err}</p>
          {linkReady ? (
            <p>
              <Link href={withLocale(locale, '/account/login')}>Log in</Link> {' '}or {' '}
              <Link href={withLocale(locale, '/account/register')}>create an account</Link>
              to sync favorites.
            </p>
          ) : null}
        </div>
      ) : loading ? (
        <p className="resultsMeta">Loading favorites...</p>
      ) : favorites.length ? (
        <ul className="recipeGrid">
          {favorites.map((f) => {
            const targetHREF = getLocalizedHref(locale, f.target?.href);

            return (
              <li key={`${f.targetType}:${f.targetSlug}`} className="recipeCard">
                <div className="recipeCardHeader">
                  <p className="badge">{f.targetType === 'RECIPE' ? 'Recipe' : 'Article'}</p>
                </div>
                <h2>
                  {targetHREF ? <Link href={targetHREF}>{f.target?.title}</Link> : f.targetSlug}
                </h2>
                <p>{f.target?.description ?? 'Saved content.'}</p>
                <div className="filterActions">
                  {targetHREF ? <Link className="cardLink" href={targetHREF}>Open</Link> : null}
                  <button type="button" onClick={() => removeFavorite(f)}>Remove</button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="emptyState">
          <h2>No favorites yet</h2>
          <p>Save recipes and articles to build your personal collection.</p>
        </div>
      )}
    </div>
  );
}
