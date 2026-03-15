'use client';

import type { ButtonHTMLAttributes } from 'react';
import { track, type AnalyticsEventName } from '@/lib/analytics';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  eventName: AnalyticsEventName;
  eventProps?: Record<string, unknown>;
};

export default function TrackedSubmitButton({
  eventName,
  eventProps,
  onClick,
  ...props
}: Props) {
  return (
    <button
      {...props}
      onClick={(event) => {
        void track({
          name: eventName,
          ts: Date.now(),
          props: eventProps,
        });
        onClick?.(event);
      }}
    />
  );
}
