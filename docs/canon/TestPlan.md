# Test Plan (Draft) — MVP Smoke Checklist

## 1. Public browsing (Guest)
- Can view home, recipes catalog, articles catalog
- Search by title works (recipes/articles)
- Filters work (meal type; article rubric)

## 2. Auth / Account
- Register / login / logout
- Preferences: language change persists

## 3. Favorites (User+)
- Add/remove favorite recipe
- Add/remove favorite article
- Favorites page shows items

## 4. Shopping list (User+)
- From recipe → “Shopping list” adds ingredients to modal/list
- Remove item / mark “have at home”
- Persist across refresh

## 5. Premium gating (server-side)
- Non-premium cannot access premium endpoints/features even if UI
  is tampered
- Premium user can access planner/advanced features

## 6. Stripe billing
- Start checkout → complete → premium access granted
- Customer Portal reachable for premium user
- Webhook idempotency: re-sending same Stripe event does not duplicate side effects

## 7. i18n + SEO sanity
- Locale routing renders correct language shell
- hreflang present (where applicable)
- sitemap endpoint exists (if implemented in MVP)
- Basic OG tags present

## 8. A11y quick pass
- Keyboard navigation works for key flows
- Basic contrast and focus visible (spot-check)
