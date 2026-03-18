export type AnalyticsEventName =
  | 'page_view'
  | 'search_performed'
  | 'content_viewed'
  | 'checkout_started'
  | 'planner_viewed'
  | 'planner_week_changed'
  | 'planner_recipe_search'
  | 'planner_item_added'
  | 'planner_item_removed'
  | 'planner_autoplan_generated'
  | 'planner_autoplan_applied'
  | 'pantry_imported'
  | 'paywall_viewed';

export type AnalyticsEvent = {
  name: AnalyticsEventName;
  ts: number;
  props?: Record<string, unknown>;
};

function sanitizeProps(props: Record<string, unknown> = {}) {
  // Privacy-safe: drop potential PII fields if passed by mistake.
  const { query, email, name, ...rest } = props as any;
  return rest;
}

export async function track(event: AnalyticsEvent) {
  try {
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        name: event.name,
        ts: event.ts,
        props: sanitizeProps(event.props),
      }),
    });
  } catch {
    // no-op
  }
}
