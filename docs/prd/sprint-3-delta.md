# Sprint 3 delta — MVP Functional Completion

Related issue: #75

Source of truth: docs/canon/PRD.md and TZ v1.0.

## Purpose

Sprint 3 is defined as **MVP Functional Completion**. It should bring the product to a demo-ready state without claiming V1 completion.

## In-scope for Sprint 3

### 1) Recipes
- recipes catalog
- search by title
- filter by meal type
- 1–3 ingredient match
- recipe detail: nutrition, servings, scaling, ingredients, steps
- favorite action
- add to shopping list

### 2) Articles
- articles catalog
- search by title
- filter by category
- article detail: content, key takeaways, related content, sources
- favorite action

### 3) Favorites and Shopping List (base)
- user-scoped favorites for recipes and articles
- shopping list: add from recipe, remove, pantry mark
- no aggregation / export / sharing in Sprint 3

### 4) Account, Auth, Billing, Paywall
- register / login / logout
- account state and subscription status
- Stripe Checkout
- Stripe Customer Portal
- webhook reliability and idempotency
- paywall entry points
- server-side premium gating is mandatory

### 5) i18n EN architecture
- EN must work as the base locale for MVP
- i18n architecture must remain compatible with EN/FR/DE/ES/IT
- new strings must be added in an i18n-ready way, not hardcoded deep in UI

### 6) Release readiness gates
- legal pages reachable
- robots.txt reachable
- sitemap.xml reachable
- analytics event sanity for search / content / paywall / checkout
- no critical runtime or access-control blockers

## Out-of-scope for Sprint 3

The following items are explicitly not Sprint 3 deliverables:

- functional meal planner completion
- nutrient summary and dashboard
- shopping list aggregation
- export/sharing for shopping list
- metric/imperial full completion
- advanced premium filters full-pack
- full SEO schema + hreflang + sitemap completion as a completion claim
- full admin CRUD/content workflow

## Demo-ready definition

Sprint 3 is demo-ready only if all of the following are true:

- Guest can open public content, search, filter, and view detail pages
- User can register/login, save favorites, and manage a shopping list
- User can open account and see subscription status
- Premium can complete checkout, receive server-side access, and manage subscription in portal

## Alignment rules

1. TZ (/docs/canon/PRD.md) is the source of truth.
2. Anything outside this scope must be marked as **Proposal**.
3. Premium gating must be enforced server-side.
4. Every feature must respect the roles Guest/User/Premium/Admin.
5. Netlify-only deployment model remains in force.
