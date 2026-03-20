# ADR-S5-v2-foundations-pantry-substitutions-autoplan

Status: Accepted for Sprint 5 kickoff  
Date: 2026-03-15  
Owners: A0 / A2  
Related issue: #165

---

## Context

The TZ release plan places V2 after V1 and defines V2 as autoplan/recommendations, substitutions, and pantry, with UGC only if needed. Sprint 4 already closed the V1 baseline in repo scope. Sprint 5 must continue from `main` with small PRs and must preserve:
- Netlify-only deployment
- Guest / User / Premium / Admin(Editor) access model
- server-side Premium gating
- EN / FR / DE / ES / IT i18n architecture
- mobile-first, security, webhook reliability, A11y, legal, SEO, analytics

This ADR defines the architectural boundaries for Sprint 5 foundations.

---

## Decision 1 — Pantry is a user-owned normalized inventory domain

Pantry will be modeled as a user-owned domain tied to normalized ingredient identity, not to arbitrary free-text labels.

### Why
- prevents uncontrolled pantry vocabulary sprawl
- makes shopping-list → pantry and recipe ingredient → pantry flows reusable
- supports deterministic pantry-aware logic in later autoplan iterations

### Consequences
- pantry CRUD requires authenticated ownership checks
- ingredient normalization source-of-truth must be shared with recipes/shopping list where possible
- first pass should allow display labels but persist a normalized ingredient key/id as the primary link
- any advanced fuzzy matching is out-of-scope for Sprint 5

---

## Decision 2 — Substitutions use deterministic content/domain rules

Substitutions will come from a server-side deterministic source-of-truth, attached to ingredient or ingredient-category mappings, optionally locale-aware via translations.

### Why
- the TZ requires substitutions in V2 but does not require AI
- deterministic rules are auditable, translatable, and safe to ship incrementally
- keeps recommendation claims narrow and accurate

### Consequences
- substitution lookup API must return ordered options from persisted domain rules
- recipe UI can render supported substitutions without inventing content
- admin/editor workflows remain the place to manage substitution content and translations
- no machine-learning or black-box ranking is introduced in Sprint 5

---

## Decision 3 — Autoplan is server-side Premium gated and deterministic

Autoplan will expose server-side generate/apply contracts and will be Premium-only. UI visibility alone is not protection.

### Why
- Premium gating is a project invariant
- the planner already exists as the canonical weekly scheduling surface
- generate/apply separation reduces accidental mutations and eases QA

### Consequences
- all autoplan endpoints must verify auth + Premium entitlement on the server
- `generate` returns a proposal and metadata, but does not mutate planner state
- `apply` persists selected proposal items into planner using existing planner invariants
- non-Premium users may see upsell UI, but API denial remains authoritative

---

## Decision 4 — Planner remains the persisted scheduling source-of-truth

Autoplan does not create a second persisted planning system. It proposes changes that apply into existing planner storage and APIs.

### Why
- avoids domain duplication
- reduces regression risk against Sprint 4 planner flows
- keeps data ownership and nutrient/shopping aggregation aligned with existing planner logic

### Consequences
- autoplan contracts must fit around existing planner week and item semantics
- QA must regression-check planner week navigation, add/remove flows, nutrient summary, and shopping aggregation

---

## Decision 5 — Keep Sprint 5 docs-first and main-based

Sprint 5 begins with docs/contracts in one small PR, followed by isolated implementation PRs from `main`.

### Why
- avoids stacked continuation drift
- minimizes regression/debug complexity
- preserves source-of-truth alignment across product, architecture, backend, analytics, and QA

### Consequences
- S5-01 is docs-only
- each later issue/PR must stay within one role-centered slice
- proposals beyond TZ are explicitly marked `Proposal` and not merged by default

---

## Rejected alternatives

### A. Free-text pantry intelligence first
Rejected because normalization drift would grow too quickly and would weaken deterministic reuse.

### B. AI recommendation framing for autoplan
Rejected because the TZ does not require ML and the sprint goal is deterministic foundation with stable gating.

### C. Client-only Premium gating
Rejected because it violates a hard project rule.

### D. New autoplan persistence model separate from planner
Rejected because it duplicates scheduling truth and increases regression risk.

---

## Validation checklist

- Netlify-only preserved
- roles preserved
- Premium gating remains server-side
- i18n preserved for EN/FR/DE/ES/IT
- no contradiction with Sprint 4 baseline
- no secrets requested or stored
