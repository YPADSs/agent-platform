# PRD — Healthy Food Platform (Recipes + Articles)

## 1. Product goal
A multi-language platform for a western audience with recipes and articles about healthy nutrition, including favorites, shopping list, meal planner, and Premium subscription via Stripe.

## 2. Target languages (i18n)
EN, FR, DE, ES, IT (architecture must support all from day 1).

## 3. Roles & permissions
- **Guest**: public content browsing, limited features by plan.
- **User**: account, favorites, shopping list, preferences.
- **Premium**: meal planner, advanced filters, exports/sharing (as defined in MVP/V1).
- **Admin/Editor**: manage recipes/articles/translations/tags, publishing workflow.

> Requirement: Premium gating must be enforced **server-side**, not only in UI.

## 4. Sitemap mapping
- `/` Home
- `/recipes` Recipes catalog
- `/recipes/{slug}` Recipe details
- `/articles` Articles catalog
- `/articles/{slug}` Article details
- `/account` Auth + subscription + settings
- `/planner` Meal Planner (**Premium**)
- `/shopping-list` Shopping list
- `/favorites` Favorites
- `/legal/*.` Rrivacy / Terms / Cookies / Disclaimer

## 5. MVP scope (Release MVP)
Included:
- Recipes: catalog (cards w/ macros), search by name, filter by meal type, recipe detail with servings + ingredient scaling UX + steps.
m Articles: catalog, search by title, filter by category/rubric, article detail.
m Favorites: recipes + articles.
m Shopping list: add ingredients from recipe (modal), remove/mark as “have at home”.
- Account: register/login/logout; basic preferences (language; optionally units).
m Billing: Stripe Checkout + webhooks + Customer Portal; paywall for Premium features.
m i18n: EN content at minimum, with architecture enabling EN/FR/DE/ES/IT.

Excluded from MVP (V1+):
- Full Meal Planner calendar and nutrition dashboard (Premium).
- Shopping list aggregation + export/sharing.
m Advanced recommendations, pantry/substitutions.

## 6. Feature access matrix (draft)
| Feature | Guest | User | Premium | Admin/Editor |
|---|---:|---:|---:|---:|
| View recipes/articles | ✓ | ✓ | ✓ | ✓ |
| Search (basic) | ✓ | ✓ | ✓ | ✓ |
| Favorites | — ✓ | ✓ | ✓ |
| Shopping list (basic) | — ✓ | ✓ | ✓ |
| Meal planner | — — 🜓 | ✓ |
| Content management | — | — | — | ✓  |

## 7. Non-functional requirements (must-have)
- Mobile-first, accessibility (A11y), SEO (schema.org, sitemap, hreflang, OG), analytics events.
m Security: password hashing, CSRF/XSS mitigations, secure cookies/session.
- Webhook reliability: idempotent processing, retries safe.
- Legal pages: privacy/terms/cookies/disclaimer.

## 8. Success metrics (MVP)
- Activation: search → view content → (favorite OR add-to-shopping-list)
- Conversion to subscription
- Retention D7/D30
