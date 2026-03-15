'use client';

import { useEffect } from 'react';
import { track, type AnalyticsEventName } from '@/lib/analytics';

type Props = {
  name: AnalyticsEventName;
  props?: Record<string, unknown>;
};

export default function EventTracker({ name, props }: Props) {
  useEffect(() => {
    void track({
      name,
      ts: Date.now(),
      props,
    });
  }, [name, props]);

  return null;
}
