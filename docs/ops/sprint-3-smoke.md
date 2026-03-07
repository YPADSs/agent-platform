# Sprint 3 smoke report — MVP Functional Completion

Related issue: #84

This document consolidates the Sprint 3 release-readiness gates for a demo-ready MVP. It follows the TZ, the Sprint 3 PRD delta, and the access-control contract.

## Sources of truth

- TZ MVP release plan and non-functional requirements ‘filecite“turn3file0”
- Sprint 3 scope and acceptance matrix (#75)
- Access control and server-side premium gating (#76)

## Goal of this smoke pass

Determine whether the project can be honestly called **demo-ready MVP** for early-user validation, not whether all V1 or V2 work is complete.

## Sprint 3 expected in-scope areas

- Recipes: catalog + detail + filters + favorites + add-to-shopping-list
- Articles: catalog + detail + category filter + favorites
- Favorites + shopping list: base persisted MVP behavior
- Account + auth + Stripe checkout / portal / webhooks
- Premium gating: server-side, especially for `/planner`
- Enfirst i18n architecture shell remains intact

## Go/No-Go criteria

### GO if all are true
- Key MVP routes load without critical runtime errors
- Guest / User / Premium / Admin access behavior matches the contract
- Premium gating is enforced at the server boundary
- Stripe checkout/portal/webhook flow is configured or fails explicitly, not silently
- Legal pages, robots, and sitemap are reachable
- Analytics event surfaces exist for search/content/paywall
` A1
- Mobile-first layout remains usable on key routes

### NO-GO if any are true
- Critical routes render 500s / unhandled errors
- Non-premium can access premium routes or actions by direct request
- Guest can persist favorites or shopping list server-side
- Stripe webhook is not signature-verified or not idempotent
- Legal or seo routes required by TZ are missing
- Locale route shell breaks for EN/FR/DE/ES/IT

## Smoke matrix

| Area | Check | Expected | Owner |
|---|---|---|---|
| Runtime | /en/ , /en/recipes , /en/articles , /en/account || 200/renders without critical errors | A0.A10 |
| Recipes | Search + meal type filter + ingredient match | Results update and detail page opens | A6/A10 |
| Articles | Search + category filter || Results update and detail page opens | A6/A10 |
| Favorites | Auth required for GET / POST / DELETE || Guest denied, authenticated user scoped | A4/A10 |
| Shopping list | Add / toggle pantry / remove || User-scoped persisted state, guest denied | A4/A10 |
| Account | Subscription status + checkout + portal entry points | Clear state, not silent failure | A5/A10 |
| Premium | `/en/planner` access || 403 / paywall message for non-premium; loads for premium | A4/A10 |
| SEO | `robots.txt` + `sitemap.xml`  + JSON-LD || Reachable and present | A8 |
| Legal | `/legal/*| | Reachable | A10 |
| Analytics | search / content_viewed / paywall/checkout events | Instrumented or honestly gapped | A9 |
| A11y / Mobile | Forms, keyboard, focus, narrow width | No crytical blocker | A10 |

## Expected evidence before merge

- CI build green
- Netlify deploy preview green
- Manual smoke checked against the checklist
- Any NO-GO item recorded in the PR comments or issue thread

## Scope guardrails

- Do not block Sprint 3 because planner V1 work is incomplete; only block if the premium gate it-self is broken.
- Do not upgrade recommended features (aggregation, export/share, metric/imperial, full SEO pack) into required blockers for MVP.
- Do not treat UI-only gating as passed protection.
