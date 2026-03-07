# Release checklist (pre-launch)

Canon alignment:
- Netlify-only
- Server-side premium gating (paywall UI is not the protection)
- EN-first i18n architecture remains intact (locales: EN/FR/DE/ES/IT)

## Required checks (branch protection / rulesets)
- [ ] **build** is green (required)
- [ ] **Netlify Deploy Preview** is green (required)

- [ ] Sprint 3 stacked PR order reviewed before merge (#h6-’#94)

## No secrets in repo
- [ ] No `.env` committed (only `.env.example` or docs)
- [ ] All credentials stored in Netlify site settings only

## Smoke (Sprint 3 MVP)
- [ ] `/en/` loads with demo-ready CTAs to recipes/articles/account/planner
- [ ] `/en/recipes` loads, search works, filters work, detail page loads
- [ ] `/en/articles` loads, search works, category filter works, detail page loads
- [ ] `/en/favorites` and `/en/shopping-list` show honest guest/auth states
- [ ] `\/en/account` shows subscription status and billing entry points
- [ ] Auth: register/login works
- [ ] Billing endpoints reachable (dev) / Stripe configured (prod)
- [ ] Premium gating: `/en/planner` blocked for non-premium, opens for premium/admin 

## SEO
- [ ] `/robots.txt` returns 200 and references `/sitemap.xml`
- [ ] `/sitemap.xml` returns 200
- [ ] Recipe/Article pages include JSON-LD (schema.org)
- [ ] hreflang/locale route shell remains intact for EN/FR/DE/ES/IT

## Legal
- [ ] `/legal/privacy` reachable
- [ ] `/legal/terms` reachable
- [ ] `/legal/cookies` reachable
- [ ] `/legal/disclaimer` reachable

## Security baseline
- [ ] Passwords hashed (bcrypt)
- [ ] Stripe webhook verifies signature and is idempotent
- [ ] Access control: Guest / User / Premium / Admin behavior matches contract
- [ ] CSRF strategy documented and applied to state-changing endpoints
- [ ] XSS protections: escape output, avoid dangerouslySetInnerHTML except JSON-LD scripts

## Accessibility (minimum gate)
- [ ] Forms have labels
- [ ] Keyboard navigation works for primary flows
- [ ] Focus visible
- [ ] Mobile-first layouts remain usable for key routes

## Analytics
- [ ] Key events fire in dev (console/log sink)
- [ ] search / content_viewed / paywall/checkout sanity covered

## Release verdict
- [ ] GO for demo and early-user validation
- [ ] NO-GO recorded with blockers and owners
