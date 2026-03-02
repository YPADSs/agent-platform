'use client';

import { useCallback } from 'react';
import { track } from '@/lib/analytics';

export default function SearchForm({
  kind,
  defaultValue,
}: {
  kind: 'recipes' | 'articles';
  defaultValue?: string;
}) {
  const onSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      const formData = new FormData(e.currentTarget);
      const q = String(formData.get('q') ?? '');
      track({
        name: 'search_performed',
        ts: Date.now(),
        props: { kind, query_length: q.length },
      });
    },
    [kind]
  );

  return (
    <form method="GET" onSubmit={onSubmit}>
      <label>
        Search:{' '}
        <input
          name="q"
          defaultValue={defaultValue || ''}
          aria-label={`Search ${kind}`}
        />
      </label>
      <button type="submit">Go</button>
    </form>
  );
}
