# Sprint 5 PRD Delta — V2 Foundations: Pantry, Substitutions, Autoplan

Status: Draft for A0/A1 approval  
Sprint: 5  
Brand: Nourivo  
Source of truth: TZ RU v1 and merged Sprint 4 baseline

---

## 1. Context

Sprint 4 closed the V1 line in repo scope: planner calendar, nutrient summary, shopping-list aggregation, metric/imperial surfacing, SEO V1, and analytics V1. Sprint 5 starts the V2 line in the exact order implied by the TZ release plan: pantry, substitutions, and autoplan foundations.

This delta does not change the TZ. It narrows Sprint 5 to deterministic, implementation-ready foundations and explicitly excludes UGC unless separately approved as a Proposal.

---

## 2. Sprint goal

Create the first V2 foundation for Premium meal-planning intelligence without breaking Sprint 4 stability.

---

## 3. In-scope

### 3.1 Pantry foundation
- Persisted pantry inventory for authenticated users.
- Pantry CRUD with normalized ingredient mapping.
- Ability to create pantry items from:
  - manual shopping-list items
  - planner-generated shopping-list items
  - future recipe-linked ingredient actions
- Pantry-aware availability surface for shopping-list and recipe-adjacent flows.
- Guest has no persisted pantry.
- Admin/Editor does not use pantry as an editorial function.

### 3.2 Substitutions foundation
- Deterministic substitution source-of-truth per ingredient or ingredient category.
- Server-side lookup contract returning ordered substitution options.
- Recipe detail surface can present substitution suggestions V1.
- No AI, generative, or black-box recommendation claims.
- Substitution data is content/domain driven and translatable.

### 3.3 Autoplan contract foundation
- Premium-only server-side autoplan generate/apply capability.
- Deterministic heuristic V1 based on:
  - user preferences
  - allergies / diet restrictions
  - meal slots
  - available recipes
  - optional pantry-aware prioritization when pantry coverage exists
- Autoplan returns a plan proposal first; apply is an explicit second action.
- Planner remains the source of truth for persisted scheduled meals.

### 3.4 Analytics V2 minimum
- `autoplan_started`
- `autoplan_generated`
- `autoplan_applied`
- `substitution_viewed`
- `substitution_applied`
- `pantry_item_added`
- `pantry_item_removed`

### 3.5 QA / security / regression expectations
- Premium enforcement remains server-side on autoplan endpoints.
- Pantry endpoints require authenticated ownership checks.
- Substitution lookup must not expose admin-only draft content.
- Planner / shopping-list / onboarding Sprint 4 flows must not regress.

---

## 4. Out-of-scope

- UGC by default
- social/community features
- AI/LLM recommendation claims
- broad redesign
- nutrition dashboard expansion beyond TZ
- changes to Stripe architecture unless strictly required
- free-text pantry intelligence or semantic ingredient matching beyond normalized V1

---

## 5. Roles and access

|Capability | Guest | User | Premium | Admin/Editor |
|---|---|---|---:|---:|
 | View recipe substitutions | Yes (public recipe context) | Yes | Yes | Operational visibility only |
 | Persist pantry inventory | No | Yes | Yes | No end-user pantry role |
 | Add pantry item from shopping list | No | Yes | Yes | No |
 | Generate autoplan | No | No | Yes | No |
 | Apply autoplan to planner | No | No | Yes | No |
 | Manage substitution source-of-truth | No | No | No | Yes |
 | Manage translation content for substitutions | No | No | No | Yes |

Rules:
- UI gating may improve UX, but protection is not complete unless enforced on the server.
- Guest may see public substitution hints only where recipe content is public.
- Autoplan is Premium-only and blocked server-side for all non-Premium callers.

---

## 6. Core user stories

### 6.1 Pantry
1. As a signed-in User, I can create, edit, and remove pantry items tied to normalized ingredients.
2. As a signed-in User, I can mark shopping-list items as already available at home and persist them into pantry.
3. As a Premium user, I can see pantry-aware availability when reviewing planner-generated shopping-list output.
4. As a Guest, I do not get a persisted pantry and cannot call pantry APIs.

### 6.2 Substitutions
1. As a visitor reading a recipe, I can view deterministic substitutions for supported ingredients.
2. As a signed-in user, I can apply a substitution choice in recipe/planner-adjacent UX where supported.
3. As an Admin/Editor, I can manage substitution content and translations through admin workflows, outside this sprint implementation path.

### 6.3 Autoplan
1. As a Premium user, I can request an autoplan proposal for a target week.
2. As a Premium user, I can review the generated proposal before applying it.
3. As a Premium user, I can apply the proposal into planner slots without bypassing planner ownership and validation rules.
4. As a non-Premium user, I may see upsell UI, but server APIs still deny generate/apply operations.

---

## 7. UX rules and states

### 7.1 Pantry
States:
- loading
- empty pantry
- list with items
- add/edit success
- validation error
- ownership/auth error
- localized unit display where relevant

### 7.2 Substitutions
States:
- substitutions available
- no substitutions available
- unsupported ingredient
- loading/error
- locale fallback content when translation is missing

### 7.3 Autoplan
States:
- upsell / gated non-premium
- loading generation
- generated plan with rationale summary
- no feasible plan result
- apply success
- apply partial failure / conflict
- regeneration after preference changes

---

## 8. Product rules

1. Pantry normalization must use a strict source-of-truth key and not depend on arbitrary free-text.
2. Pantry is user-owned data only.
3. Substitutions must be deterministic and traceable to content/domain rules.
4. Autoplan must not present itself as AI or personalized medical advice.5. Autoplan proposal must respect user restrictions and planner slot structure.
6. Planner remains the only persisted weekly meal-plan source-of-truth.
7. Any feature beyond this Sprint 5 scope must be marked `Proposal`.

---

## 9. Acceptance criteria

Sprint 5 docs delta is accepted when:
1. Pantry is defined as a real persisted feature for authenticated users.
2. Substitutions are defined as deterministic server-side lookup with editable source-of-truth.
3. Autoplan is defined as a Premium-only server-side feature with generate/apply separation.
4. Role handling remains explicit for Guest / User / Premium / Admin(Editor).
5. Sprint 4 planner, shopping-list, onboarding, analytics, and SEO baselines are not contradicted.
6. i18n expectations remain EN / FR / DE / ES / IT.7. No requirement introduces secret handling in chat or drifts from Netlify-only deployment.

---

## 10. Handoff

After PRD approval:
- A2: lock AdR for pantry ownership, substitution source-of-truth, autoplan boundaries
- A3: derive pantry/substitution data model and indexes
- A4: formalize API contracts and server-side gating behavior
- A6: map UI entry points and mobile/A11y states
- A7: define translation workflow/glossary additions
- A9: wire event taxonomy details
- A10: define regression/security gates
