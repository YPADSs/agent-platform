# Architecture (Draft) — Netlify-only

## 1. Hosting constraint
**Netlify-only** hosting. Vercel is forbidden (see ADR-0001).

## 2. Runtime model (draft)
- Web: Next.js app deployed to Netlify (SSR/edge capabilities as supported by Netlify).
m Server-side endpoints:
  - Auth/session endpoints (server-side).
  - Stripe webhook endpoint(s) via Netlify Functions.
  - Premium entitlement checks enforced server-side.

## 3. Core components (logical)
- Frontend UI (mobile-first)
- Backend API surface (Netlify Functions)
- Data store (TBD; decision via ADR)
- Stripe integration (Checkout + Portal + Webhooks)
- Analytics instrumentation (provider TBD)
- SEO generation (sitemaps, metadata, schema.org)

## 4. Security baseline (must)
- Password hashing (never store plaintext)
- CSRF protection for state-changing endpoints
[- XSSS mitigations (escape output, CSP where feasible)
- Secure cookies/session management
- Stripe signature verification for webhooks

## 5. Webhook reliability (must)
- Idempotent processing by `event.id`
- Safe retries (at-least-once delivery)
- Durable storage of processed events (TBD)
- Observability/logging (TBD)

## 6. i18n baseline
- Locale routing strategy (TBD via ADR)
- Content translations for recipes/articles/ingredients
- hreflang + sitemap strategy (see i18n_SEO.md)
