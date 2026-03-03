'use client';

import { useEffect } from 'react';
import { track } from '@/lib/analytics';

export default function ViewTracker({
  kind,
  slug,
}: {
  kind: 'recipe' | 'article';
  slug: string;
}) {
  useEffect(() => {
    track({
      name: 'content_viewed',
      ts: Date.now(),
      props: { kind, slug },
    });
  }, [kind, slug]);

  return null;
}
