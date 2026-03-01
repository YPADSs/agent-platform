# Test Plan — v1 (MVP smoke + security)

date: 2026-03-02

Scope: MVP smoke checklist aligned to ТЗ, including security, server-side premium gating, and Stripe webhook reliability.

---

## 1) Public browsing (Guest)
- Home page loads (value proposition + CTAs)
- Recipes catalog loads; cards show title/desc/KБЖУ
- Articles catalog loads; cards show title/rubric
- Search works:
  - recipes by name
  - articles by title
- Filters work:
  - recipes by meal type
  - articles by rubric

---

## 2) Auth / Account
- Register / login / logout works
- Password storage: verify password is hashed (no plaintext in DB/logs)
- Session/cookies:
  - cookies marked Secure/HttpOnly where applicable
  - session persists correctly across refresh
- Preferences:
  - language change persists (locale)
  - onboarding fields exist (goal/preferences/allergies/language) (V1+)

---

## 3) Favorites (User+)
- Add/remove favorite recipe
- Add/remove favorite article
- Favorites page lists items (recipes + articles)

---

## 4) Shopping list (User+)
- From recipe detail → “Shopping list” adds ingredients to modal/list with quantities
- Remove item
- Mark item as “have at home” (pantry)
- Persist across refresh

---

## 5) Premium gating (MUST be server-side)
Negative tests (Guest/User without premium):
- Cannot access premium pages/endpoints (e.g. `/planner`) even if UI is tampered (direct URL / API call)
- Advanced filters / export/sharing endpoints return 403/401 as appropriate

Positive tests (Premium):
- Premium user can open planner (where implemented)
- Premium-only features are available

---

## 6) Stripe billing (MVP)
- Start checkout → complete → premium access granted (server-side)
- Customer Portal session can be created for subscribed user
- Webhook handler:
  - verifies Stripe signature
  - idempotency: re-sending the same Stripe `event.id` does not duplicate side effects
  - retry-safe: simulated retry (same payload) converges to same state

---

## 7) Security quick checks (MVP baseline)
- CSRF:
  - state-changing endpoints protected (token/double-submit strategy; implementation detail)
- XSS:
  - user-controlled content is escaped/sanitized (especially article content rendering)
- Access control:
  - role checks enforced server-side for admin/editor endpoints
- Rate limiting / abuse:
  - basic protection is planned (implementation detail); confirm no obvious unauthenticated abuse endpoints in MVP

---

## 8) i18n + SEO sanity
- Locale routing renders correct language shell
- hreflang present where translations exist
- canonical tags present (especially when fallback is used)
- sitemap endpoint exists (if included in MVP scope)
- Basic OG tags present

---

## 9) A11y quick pass
- Keyboard navigation works for key flows (search, open recipe, add to favorites, open shopping list modal)
- Focus visible and not trapped in modals
- Form labels for auth fields are present (screen reader basics)
