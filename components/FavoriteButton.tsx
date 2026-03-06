'use client';

import { useState } from 'react';

type TargetType = 'RECIPE' | 'ARTICLE';

export default function FavoriteButton({
  targetType,
  targetSlug
}: {
  targetType: TargetType;
  targetSlug: string;
}) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  async function onClick() {
    setStatus('saving');
    setMessage(null);

    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ targetType, targetSlug })
      });

      if (res.status === 401) {
        setStatus('idle');
        setMessage('Please log in to save favorites.');
        return;
      }

      if (!res.ok) {
        setStatus('idle');
        setMessage('Failed to save favorite. Please try again.');
        return;
      }

      setStatus('saved');
      setMessage('Saved to favorites.');
    } catch {
      setStatus('idle');
      setMessage('Failed to save favorite. Please try again.');
    }
  }

  return (
    <div>
      <button type="button" onClick={onClick} disabled={status === 'saving' || status === 'saved'}>
        {status === 'saving' ? 'Saving...' : status === 'saved' ? 'Saved' : 'Add to favorites'}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}
