'use client';

import { useState } from 'react';
import { track } from '@/lib/analytics';

type RecipeActionsProps = {
  slug: string;
  servings: number;
};

export default function RecipeActions({ slug, servings }: RecipeActionsProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);  const [pendingAction, setPendingAction] = useState<string | null>(null);

  async function runAction(
    type: 'favorite' | 'shopping-list',
    url: string,
    options?: RequestInit,
  ) {
    setError(null);
    setMessage(null);
    setPendingAction(type);

    try {
      const response = await fetch(url, options);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          setError('Please log in to use this feature.');
          return;
        }
        setError(data.error ?? 'Action failed.');
        return;
      }

      if (type === 'favorite') {
        setMessage('Saved to favorites.');
        void track({
          name: 'content_viewed',
          ts: Date.now(),
          props: { kind: 'recipe', action: 'favorite', slug },
        });
      } else {
        setMessage(`Added ${data.added ?? 'some'} items to shopping list.`);
        void track({
          name: 'content_viewed',
          ts: Date.now(),
          props: { kind: 'recipe', action: 'shopping_list', aslug: slug },
        });
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <div className="recipeActions">
      <div className="recipeActionRow">
        <button
          type="button"
          onClick={() =>
            runAction('favorite', `/api/recipes/${slug}/favorite`, { method: 'POST' })
          }
          disabled={pendingAction !== null}
        >
          {pendingAction === 'favorite' ? 'Saving...' : 'Add to favorites'}
        </button>
        <button
          type="button"
          onClick={() =>
            runAction(
              'shopping-list',
              `/api/recipes/${slug}/shopping-list`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ servings }),
              },
            )
          }
          disabled={pendingAction !== null}
        >
          {pendingAction === 'shopping-list' ? 'Adding...' : 'Add ingredients to shopping list'}
        </button>
      </div>
      {message ? <p className="statusMessage">{message}</p> : null}
      {error ? <p className="statusError">{error}</p> : null}
    </div>
  );
}
