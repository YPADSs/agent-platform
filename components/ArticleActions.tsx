'use client';

import { useState } from 'react';
import { track } from '@/lib/analytics';

type ArticleActionsProps = {
  slug: string;
};

export default function ArticleActions({ slug }: ArticleActionsProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function addFavorite() {
    setPending(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/articles/${slug}/favorite`, { method: 'POST' });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(response.status === 401 ? 'Please log in to save articles.' : data.error ?? 'Action failed.');
        return;
      }

      setMessage('Saved to favorites.');
      void track({
        name: 'content_viewed',
        ts: Date.now(),
        props: { kind: 'article', action: 'favorite', slug },
      });
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="recipeActions">
      <div className="recipeActionRow">
        <button type="button" onClick={addFavorite} disabled={pending}>
          {pending ? 'Saving...' : 'Add to favorites'}
        </button>
      </div>
      {message ? <p className="statusMessage">{message}</p> : null}
      {error ? <p className="statusError">{error}</p> : null}
    </div>
  );
}
