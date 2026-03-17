# ADR-S5 — V2 foundations for pantry, substitutions, and autoplan

Related issue: #179

## Status
Accepted for Sprint 5 docs/contract level.

## Context

After V1 closure, the project needs a controlled entry point into V2 capabilities without scope explosion or architecture drift.

The TZ direction for V2 is:
 - pantry
- substitutions
- autoplan / recommendations

The project also retains non-negotiable invariants:
 - Premium gating must be server-side.
 - i18n architecture EN / FR / DE / ES / IT must remain intact.
- Netlify-only deployment model must remain intact.
- UGC is out of scope unless explicitly prioritized.
- No AI/ML/black-box claims in V2 v1.

## Decisions

### 1) Pantry ownership and scoping
Pantry is a per-user persisted capability for authenticated User and Premium accounts.

- Guest cannot read or mutate persisted pantry data.
- Pantry data is scoped to the authenticated principal.
- Admin/Editor role does not imply broad access to end-user pantry data unless an explicit admin workflow is defined later.

### 2) Normalized ingredient source of truth
Pantry and substitutions share a normalized ingredient-key model as the canonical domain layer.

- The first pass does **not** use free-text intelligence as the source of truth.
- User-facing text may exist for display but must map to a stable key or category.
- This key is the join point for:
  - pantry availability
  - shopping list marking-into-pantry
  - substitution lookup
  - autoplan heuristics

### 3) Substitution source of truth
Substitutions are defined as a deterministic, server-resolved rule set per ingredient key or category.

- Substitutions are not AI-generated.
- The server returns specific suggestions with reasons and limitation notes when applicable.
- The contract must allow empty results when no safe or curated substitution exists.

### 4) Autoplan gating and strategy
Autoplan is a Premium-only, server-side capability.

- UI gidance may hint or tease autoplan, but the server is the authority for access.
- The first pass is a deterministic heuristic, not a machine-learning system.
- Autoplan generation must be idempotent at the request/response level where practical and must not mutate the planner until an explicit apply step occurs.

### 5) Composition order to avoid regressions
The V2 delivery order is:

1. docs/contracts
2. pantry data model
3. pantry API + UI
4. substitution model + API + UI
5. autoplan contract + generator
6. autoplan apply flow
7. analytics + QA/hardening

This order protects Sprint 4 planner stability and avoids a single giant implementation PR.

## Consequences

- Data model work must introduce an ingredient key strategy before pantry or analytics expand too far.
- Substitutions may ship with partial coverage, but the contract must be honest when no rule exists.
- Autoplan may use pantry-aware signals only after pantry foundation lands.
- Product messaging must avoid "AI" or "understanding you" language for this V1 autoplan pass.

- UIG stays out of scope until explicitly prioritized in a later issue.
