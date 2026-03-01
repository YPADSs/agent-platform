# PRD — Healthy Food Platform (Recipes + Articles)

Version: 1.0 (canon v1)

date: 2026-03-02

> Source of truth: ТЗ v1.0 (ground rules, roles, sitemap, MVP/V1/V2).

- Hosting constraint: **Netlify-only** (Vercel forbidden, see ADR-0001).
- Monetization: Freemium + Premium (monthly subscription via Stripe).

---

## 1) Mission / Product goal
A <western audience> content platform about healthy nutrition with:

- Recipes (search/filters/scaling/shopping list)
- Articles (catalog/filters/favorites)
- Account + Stripe subscription
- Onboarding + higher-value Premium features (Meal Planner, nutrition goals, advanced filters)

---

## 2) Target languages (i18n)
Application must support EN/FR/DE/ES/IT architecturally from day 1.

- MVP: EN content at minimum. Other locales may land later via the translation workflow.
- SEO: hreflang + sitemaps must be considered for multi-locale (see i18n_SEO.md).

---

## 3) Roles & permissions
**Golden rule: Premium gating must be enforced at the server level (not only the UI).**

- **Guest**
  - View public content (recipes/articles)
  - Basic search
  - Shopping list mechanics may be limited by tariff (see tariff table).
- **User** (authenticated)
  - Favorites (recipes and articles)
  - Shopping list (basic)
  - Preferences (language, units, diets/allergies/goals)
- **Premium**
  - Meal Planner (weekly calendar, meal blocks)
  - Expanded filters (recipes/diets/nutrition goals)
  - Export/sharing (as defined in tariff/planned versions)
- **Admin/Editor**
  - Content management: CRUD recipes/articles, ingredient dictionary
  - Translations workflow: draft → review → published

---

## 4) Sitemap (/ information architecture)
- `/` Home (Value proposition, collections, CTAs)
- `/recipes` Recipes catalog
- `/recipes/{slug}` Recipe detail page
- `/articles` Articles catalog
- `/articles/{slug}` Article detail page
- `/account` Account / Subscription / Settings
- `/planner` Meal Planner — **Premium**
- `/shopping-list` Shopping list
- `/favorites` Favorites
- `/legal/*` Privacy / Terms / Cookies / Disclaimer

---

## 5) Key functional requirements (MVP)

### 5.1 Home page
- Value proposition for healthy nutrition (pluses and health impact)
- Collections/curated lists (e.g. 15‑minute dinners, High‑protein breakfasts)
- CTAs to Recipes / Articles / Meal Planner (Planner CTA is paywall for non-premium)

### 5.2 Articles
Catalog:
- Cards
- Search by title
- Filter by rubrics (master-classes / products / other)

Favorites:
- Add/remove articles from favorites

Article detail:
- Content including images
- Key takeaways
- Related recipes/articles
- Sources/references section (as content field)

### 5.3 Recipes
Catalog:
- Cards with: title, short desc, calories, protein, fat, carbs (КБЖУ)
- Filter by meal type: breakfast, lunch, dinner, desserts, snacks, soups, drinks, salads
- Search by name
- Ingredient backed search: select 1–3 ingredients to match recipes

Recipe detail:
- КБЖУ
- Servings: changed servings recalculates ingredient quantities proportionally (Recipe scaling UX)
- Ingredients list with proportions (g/units)
- Step-by-step cooking instructions
- Favorite toggle
- "Shopping list" button: adds all ingredients to a modal list with quantities and allows removal or marking `have at home`.

### 5.4 Shopping list (MVP)
- Add ingredients from a recipe to a modal/workflow list
- Remove items or mark them as `have at home` (pantry)
- Requirement: reflect accessible modal controls (keyboard and screen reader basics)

### 5.5 Account + Stripe
- Auth: register / login / logout
- Preferences: language, (desirable) units, diets, allergies, nutrition goals
- Subscription upgrade flow via Stripe Checkout
- Subscription management via Stripe Customer Portal
- Paywall for Premium features
  - Server-side gating must be enforced.
  - Webhook pipeline must be retry-safe and idempotent.

### 5.6 Onboarding + Meal Planner (Premium, V1+)
Onboarding (after registration):
- Goal
- Preferences
- Allergies
- Language (and desirably units)

Meal Planner:
- Weekly calendar with slots (breakfast/lunch/dinner/snacks)
- Nutrient summary and shopping list generation (V1+)

---

## 6) Tariff (Free vs Premium) — (from ТЗ)
| Feature | Free | Premium |
|---|---|---|
| View recipes/articles | ✓ | ✓ |
| Basic search | ✓ | ✓ |
| Favorites | Limit (optional) | Unlimited |
| Shopping list | Basic | Aggregation + export/sharing |
| Meal Planner | — | ✓ |
| Nutrition goals/dashboard | — | ✓ |
| Advanced filters | Limited | ✓ |

> Note (from ТЗ recommendations): annual plan with discount and a trial (7 days) are recommended for future iterations. They are not required for MVP.

---

## 7) Release phasing (MVP → V1 → V2)
- **MVP**: recipes + articles (search/filters/favorites), shopping list (base), auth + Stripe + paywall, i18n EN (architecture enables all locales).
- **V1**: meal planner calendar + nutrients summary, shopping list aggregation, metric/imperial, SEO: schema + hreflang + sitemap.
- **V2**: autoplanning/recommendations, substitutions + pantry, UGC (if needed).

---

## 8) Success metrics (MVP)
- Activation: search → recipe view → action (favorite or add-to-shopping-list)
- Conversion: paywall → checkout → premium
- Retention: D7 / D30

---

## 9) Standards / Non-functional (Done = must have)
- Mobile-first
- A11y (basic keyboard and focus)
- Security: password hashing, CSRF/XSS mitigations, secure cookies/sessions
- Webhooks: idempotent handling, retry-safe
- SEO: schema.org Recipe/Article, sitemap, hreflang, OG, CWV baseline
- Legal pages: privacy / terms / cookies / disclaimer

---

## 10) Links to canon docs
- Architecture: docs/canon/Architecture.md
- Billing/Stripe: docs/canon/Billing_Stripe.md
- DataModel: docs/canon/DataModel.md
- i18n workflow: docs/canon/i18n_Content_Workflow.md
- i18n SEO: docs/canon/i18n_SEO.md
- Analytics: docs/canon/Analytics.md
- TestPlan: docs/canon/TestPlan.md
