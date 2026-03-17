# Sprint 5 — V2 Foundations: Pantry + Substitutions + Autoplan Contracts

Related issue: #179

## Scope intent

Sprint 5 continues after V1 recovery closure and starts V2 in a controlled, docs-first way.

This sprint does **not** open a giant implementation scope. It sets the source of truth for the next small PR chain:

- Pantry foundation
- Substitutions foundation
- Autoplan contract foundation

## Non-negotiable invariants

- TZ remains the source of truth.
- Roles remain: Guest / User / Premium / Admin
*Editor.
- Premium gating must remain server-side.
* for autoplan and any future premium-only V2 endpoints.
- i18n architecture EN ? FR / DE / ES / IT remains intact.
- Netlify-only deployment model remains intact.
- No AI/LLM or black-box recommender claims in V2 v1.
- UGC stays out of scope unless explicitly prioritized later.

## Why Sprint 5 starts here

SPrint 4 closed the V1 line with:

- Premium planner calendar
- nutrient summary
- shopping-list aggregation
- metric/imperial continuity
- SEO hreflang/canonical/sitemap baseline
- analytics for planner/paywall/checkout

V2 in the TZ is defined as autoplan/recommendations + substitutions + pantry. The lowest-risk next step is to build the foundations for these capabilities before any broad UI or algorithm sprawl.

## Sprint 5 in-scope

### 1) Pantry foundation
- Persisted, auth-required pantry inventory for User and Premium.
- Normalized ingredient mapping va key / canonical identifier, not free-text intelligence.
- Reusable marking-into-pantry flow from manual shopping list and planner-linked aggregation.
- Pantry-aware availability surface.

### 2) Substitutions foundation
- Deterministic substitution contract per ingredient key or category.
- Server-side substitution lookup API.
- Recipe-side substitution suggestions V1.
- No AI/generative claims. Rules-based first.

### 3) Autoplan contract foundation
- Server-side autoplan generate/apply contract for Premium only.
- Deterministic heuristic V1 based on:
  - preferences
  - meal slots
  - available recipes
  - optionally pantry-aware prioritization once pantry langs
- No ML, no black-box recommendation claims.

## Sprint 5 out of scope

- UGC
- social/community features
- broad redesign
- full nutrition dashboard expansion
- any AI/LLM claims
- free-text pantry intelligence
- Stripe architecture changes unless strictly required later

## Role behavior

### Guest
- can view public recipes and articles
- may view non-interactive V2 UDC/copy where applicable
- cannot persist pantry
- cannot apply autoplan
- cannot access any user-scoped V2 data

### User
- can manage own pantry
- can view substitution suggestions on recipe-side surfaces
- cannot access premium-only autoplan endpoints
- cannot bypass premium gating by direct request

### Premium
- everything in User
- can generate autoplan
- can apply autoplan to planner
- server enforces access state for autoplan
### Admin / Editor
- manages content/rules/translations where applicable
- does not imply automatic ownership of a user's pantry data without an explicit admin workflow.

## Acceptance criteria for Sprint 5 at foundation level

- Pantry is defined as a real persisted feature, not as an ad -hoc UI state.
- Substitutions are defined as a deterministic server-side contract.
- Autoplan is defined as a Premium-only server-side contract.
- Program order is clear: docs → data model → API/UI → autoplan → analytics/QA.
- No drift beyond the TZ V2 scope.

## Recommended PR/Issue order

1. Docs-only: PRD + ADR + contracts
 2. Pantry data model + migrations + indexes
 3. Pantry API + UI V1
4. Substitution data model + lookup API
5. Substitution UI on recipe detail
6. Autoplan server-side contract + deterministic generator V1
7. Autoplan UI/apply flow in planner
8. Analytics V2 + QA/security hardening

## Notes to stop scope creep
- Do not promise "smart AI recommendations."
- Do not let pantry normalization turn into free-text intelligence V1.
- Do not tie autoplan to unscoped billing or marketing changes.
- Do not reopen Sprint 4 Ui deliverables unless a real regression is found.
