# Architecture v1 — Netlify-only (Healthy Food Platform)

> Constraint: **Netlify-only** hosting. **Vercel is forbidden** (see ADR-0001).

## 1. High-level system
- **Web app**: Next.js app deployed on Netlify (SSR where supported).
- **Server-side API surface**: Netlify Functions for:
  - auth/session endpoints
  - Stripe billing endpoints (create Checkout/Portal sessions)
  - Stripe webhooks (event ingestion)
  - premium entitlement checks (server-side gating)
- **Data store**: TBD (recorded via ADJ when chosen).
- **Content**: recipes + articles + translations (managed by Admin/Editor workflow).
 - **SEO**: schema.org, sitemap, hreflang (see i18n_SEO.md).
- **Analytics**: MPV event taxonomy (see Analytics.md).

## 2. Deployment model (Netlify)
### 2.1 Environments
- **Production**: `main` branch deploy.
- **Preview deploys**: per-PR deploy previews (Netlify).
- **Environment variables**: managed in Netlify UI (never committed).

### 2.2 Runtime & routing (draft, Netlify-compatible)
- Next.js routes:
  - Public pages: `/`, `/recipes`, `/recipes/[slug]`, `/articles`, `/articles/[slug]`, `/legal/*`
  - Auth/account: `/account`
  - Premium area: `/planner`
- Server-side endpoints are implemented as Netlify Functions (HTTP):
  - `/api/auth/*`
  - `/api/billing/*`
  - `/api/webhooks/stripe`
  - `/api/entitlements` (or equivalent)
> Note: exact route mapping depends on chosen Next.js + Netlify adapter, but the **capability** and **ownership boundaries** remain as above.

## 3. Role-based access & Premium gating (must)
Roles: Guest / User / Premium / Admin (Admin includes Editor permissions for content).

**Rule:** Premium-only capabilities must be enforced **server-side**, not only in UI.
- UI may hide premium features, but API must validate entitlement for every premium endpoint.
- Entitlement source of truth: Stripe subscription state synchronized via webhooks.

## 4. Stripe integration & webhook reliability (must)
### 4.1 Core flows
- Upgrade:
  1) authenticated user requests Checkout session (server-side)
  2) redirect to Stripe Checkout
  3) Stripe sends webhook(s) „ system updates subscription state
- Manage subscription:
  1) authenticated user requests Customer Portal session (server-side)
  2) redirect to Stripe Portal

### 4.2 Webhook handler contract
- Verify Stripe signature on every webhook request.
 - Process is **idempotent** by `event.id` .
 - Must be **retry-safe** (Stripe delivers at-least-once).
- Persist processed event IDs and subscription state updates (storage mechanism TBD).
- Observability: structured logs + alerting hooks (TBD).

## 5. Security baseline (must)
- Passwords stored only as secure hashes (never plaintext).

- CSRF protection for state-changing requests (where applicable).
- XSSS mitigations (escape output; safe rendering for rich content).
- Secure session/cookies (httpOnly, secure, sameSite where appropriate).
- Rate limiting / abuse mitigation for auth and webhook endpoints (TBD, documented when implemented).

## 6. i18n baseline (must)
- Target locales: EN/FR/DE/ES/IT (architecture-ready from MPV)
- Content entities must support translations (recipes/articles/ingredients).
- SEO requirements for i18n: hreflang + sitemap rules (see i18n_SEO.md).

## 7. Admin/Editor workflow (must-have)
- CRUD (recipes/articles/ingredients) + translations.
- Lifecycle: Draft → Review → Published (see i18n_Content_Workflow.md).

- Access restricted to Admin/Editor role.

## 8. Open decisions (to be captured as ADRs)
- Data store selection and migration strategy.
- Locale routing strategy (path prefix vs subdomain vs other) and canonical policy for fallbacks.
- Observability stack (logs/alerts) and webhook dead-letter strategy.
