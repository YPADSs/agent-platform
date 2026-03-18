'use client';

import { useState } from 'react';
import { track } from '@/lib/analytics';

type BillingRedirectButtonProps = {
  endpoint: '/api/billing/checkout' | '/api/billing/portal';
  idleLabel: string;
  loadingLabel: string;
  disabled?: boolean;
  eventName?: 'checkout_started';
  eventProps?: Record<string, unknown>;
};

export default function BillingRedirectButton({
  endpoint,
  idleLabel,
  loadingLabel,
  disabled = false,
  eventName,
  eventProps,
}: BillingRedirectButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);

    try {
      if (eventName) {
        void track({ name: eventName, ts: Date.now(), props: eventProps });
      }

      const response = await fetch(endpoint, { method: 'POST' });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok || typeof payload.url !== 'string') {
        setError(typeof payload.error === 'string' ? payload.error : 'Unable to continue.');
        return;
      }

      window.location.assign(payload.url);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="plannerSidebar">
      <button type="button" onClick={handleClick} disabled={disabled || loading}>
        {loading ? loadingLabel : idleLabel}
      </button>
      {error ? <p className="statusError">{error}</p> : null}
    </div>
  );
}
