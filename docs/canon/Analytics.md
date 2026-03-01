# Analytics — v1 (MVP)

date: 2026-03-02

Goal (ТЗ): measure activation (search → recipe → action), conversion to subscription, and retention D7/D30.

---

## 1) Privacy principles (must)
- Do not store sensitive personal data in analytics events.
- Respect cookie consent and legal requirements (Privacy/Cookies pages).
- Avoid raw free-text where it may contain PII (e.g. search query). Use length or hashed/filtered approach if needed.

---

## 2) Common event properties (baseline)
Recommended properties on all events:
- `timestamp`
- `user_role` (guest|user|premium|admin_editor)
- `locale` (en|fr|de|es|it)
- `page_path`
- `page_type` (home|recipes|recipe|articles|article|account|planner|shopping_list|favorites|legal)
- `session_id` (anonymous ok)
- `referrer`, `utm_source`, `utm_medium`, `utm_campaign` (optional)

Content-related:
- `content_type` (recipe|article)
- `content_id`
- `slug` (optional)

Search/filter:
- `search_type` (recipes|articles)
- `search_query_length` (int)
- `filters_applied` (array of keys)
- `filters_values_count` (int)

Billing:
- `paywall_feature` (planner|advanced_filters|export_sharing|nutrition_goals)
- `plan_key` (premium_monthly)

---

## 3) MVP event taxonomy (required)
### Navigation / page
- `page_view`

### Search & discovery
- `search_performed` (search_type, search_query_length, filters_applied, filters_values_count)
- `filter_applied` (filter_key, filter_values_count)

### Content engagement
- `content_viewed` (content_type, content_id)
- `favorite_added` / `favorite_removed` (content_type, content_id)

### Shopping list
- `shopping_list_opened`
- `shopping_list_item_added` / `shopping_list_item_removed`
- `shopping_list_item_checked` (is_pantry)

### Paywall & billing funnel
- `paywall_viewed` (paywall_feature)
- `checkout_started` (plan_key)
- `checkout_completed` (plan_key)
- `subscription_status_changed` (from_status, to_status)

### Premium usage
- `planner_opened` (requires premium)

---

## 4) MVP KPIs (how to compute)
- Activation rate: users with `search_performed` + `content_viewed` + (`favorite_added` OR `shopping_list_item_added`) within first session/day.
- Conversion: `checkout_completed` / `checkout_started` and `subscription_status_changed` to active.
- Retention: D7/D30 returning users with any `page_view`.

