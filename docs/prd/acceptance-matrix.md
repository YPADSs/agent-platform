# Sprint 3 acceptance matrix

Related issue: #75

This matrix defines what must work by the end of Sprint 3 for the MVP Functional Completion milestone.

## Route-level matrix

| Route | Guest | User | Premium | Admin | Sprint 3 expectation |
|---|---|---|---|---|---|
| `/` | View | View | View | View | Home reachable, collections/CTA sane |
| `/recipes` | View/search/filter | View/search/filter | View/search/filter | View/search/filter | Catalog works end-to-end |
| `/recipes/{slug}` | View | View + favorite/add-to-list | View + favorite/add-to-list | View + favorite/add-to-list | Nutrition, servings, scaling, steps |
| `/articles` | View/search/filter | View/search/filter | View/search/filter | View/search/filter | Catalog works end-to-end |
| `/articles/{slug}` | View | View + favorite | View + favorite | View + favorite | Content, takeaways, related, sources |
| `/favorites` | Denied / auth CTA | View/manage | View/manage | View/manage | Auth-only route |
| `/shopping-list` | Denied / auth CTA | View/manage | View/manage | View/manage | Base list only, no aggregation/export/share |
| `/account` | Auth entry | View/manage own account | View/manage own account | View/manage own account | Auth, status, settings shell |
| `/planner` | Paywall / denied | Paywall / denied | View | View | May be gated placeholder; not claimed as completed planner |
| `/legal/*` | View | View | View | View | Privacy / Terms / Cookies / Disclaimer reachable |
| `robots.txt` | View | View | View | View | Reachable |
| `sitemap.xml` | View | View | View | View | Reachable |

## Functional acceptance

### Recipes
- search by title works
- meal type filter works
- ingredient match supports 1–3 ingredients
- detail page shows nutrition, servings, ingredients, steps
- servings/scaling updates ingredient quantities proportionally
- authenticated users can favorite recipes
- authenticated users can add recipe ingredients to shopping list

### Articles
- search by title works
- category filter works
- detail page shows content, key takeaways, related content, sources
- authenticated users can favorite articles

### Favorites
- authenticated users can list and manage saved recipes/articles
- guest users are not treated as having persisted favorites

### Shopping list
- authenticated users can add ingredients from recipe
- authenticated users can remove items
- authenticated users can mark pantry / have-at-home
- no Sprint 3 claim for aggregation, export, or sharing

### Account / Billing
- register, login, logout work
- account shows subscription status
- checkout can be started
- customer portal can be opened
- webhook processing is retry-safe and idempotent
- premium access is enforced server-side

### i18n / release readiness
- EN works as base locale
- new Sprint 3 UI strings are i18n-ready
- legal pages, robots.txt, sitemap.xml reachable
- analytics smoke exists for search/content/paywall/checkout
- no critical runtime/access-control blockers on key routes

## Non-acceptance / explicit exclusions
The following do not block Sprint 3 if they are not completed:
- full functional planner
- nutrients dashboard/summary
- shopping list aggregation
- export/share for shopping list
- metric/imperial completion
- full V1 SEO pack
- full admin CRUD workflow
