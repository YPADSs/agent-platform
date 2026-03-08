# Sprint 4 QA / Release Gates — Nourivo

Статус: Draft for A0/A10 approval

---

## 1. Functional gates

- Premium user can create/edit/delete planner items
- planner supports breakfast/lunch/dinner/snacks
- nutrient summary updates after planner change
- planner shopping list generation works
- aggregation merges only valid duplicates
- preferences save and reload correctly
- metric/imperial display stays consistent
- public SEO pages expose required outputs

---

## 2. Access control gates

- Guest cannot access planner data
- User non-premium receives 403 on Premium planner endpoints
- users cannot access other users’ planner or shopping data
- admin access, if any, is explicit and audited

---

## 3. Security gates

- no auth regression
- XSS-safe editable inputs
- CSRF protection on state-changing endpoints
- webhook replay/idempotency does not corrupt entitlements
- premium access changes follow subscription state safely

---

## 4. Data integrity gates

- unique week per user
- deterministic slot collision behavior
- no invalid unit merges
- planner delete recomputes dependent summary/list
- pantry marking does not corrupt totals

---

## 5. SEO gates

- Recipe schema valid
- Article schema valid
- hreflang reciprocal across locales
- sitemap excludes non-indexable routes
- legal pages preserved

---

## 6. Analytics gates

- required events fire
- no duplicate planner events
- no missing paywall/checkout signals
- no PII leakage
- event props match spec

---

## 7. Hard blockers

Release blocked if any fails:
- server-side Premium enforcement
- nutrient math correctness
- shopping aggregation correctness
- locale/SEO integrity
- analytics completeness
- webhook entitlement reliability
- mobile/A11y baseline
