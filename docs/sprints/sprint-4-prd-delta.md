# Sprint 4 PRD Delta — Nourivo

Статус: Draft for A0/A1 approval  
Спринт: 4  
Трек: V1 Planner & Experience Expansion  
Бренд: Nourivo

---

## 1. Контекст

Sprint 4 реализует V1-объём из ТЗ:
- meal planner календарь + нутриенты
- агрегация shopping list
- metric / imperial
- SEO schema + hreflang + sitemap【29:2†TZ_Healthy_Food_Platform_RU_v1.pdf†L55-L62】

Платформа должна сохранять:
- роли Guest / User / Premium / Admin(Editor)【29:0†TZ_Healthy_Food_Platform_RU_v1.pdf†L21-L25】
- многоязычность EN/FR/DE/ES/IT【29:5†TZ_Healthy_Food_Platform_RU_v1.pdf†L11-L12】
- mobile-first, security, webhook reliability, A11y, legal, analytics【29:2†TZ_Healthy_Food_Platform_RU_v1.pdf†L41-L45】

---

## 2. Цель Sprint 4

Перевести Nourivo из MVP в V1 за счёт Premium meal-planning experience, который:
1. помогает пользователю планировать неделю питания,
2. показывает nutrient summary,
3. генерирует shopping list,
4. уважает preferences, language и units,
5. поддерживает платёжную модель и SEO-готовность платформы.

---

## 3. Scope

### In-scope
- Meal Planner (Premium)
- Weekly calendar
- Meal slots: breakfast / lunch / dinner / snacks
- Nutrient summary
- Planner-generated shopping list
- Shopping list aggregation
- Metric / imperial units
- Onboarding + preferences
- SEO V1
- Analytics V1 for planner/paywall/conversion
- Nourivo brand foundations

### Out-of-scope
- autoplan / recommendations
- substitutions / pantry intelligence
- UGC
- full nutrition dashboard
- V2 features【29:2†TZ_Healthy_Food_Platform_RU_v1.pdf†L59-L62】

---

## 4. Продуктовый delta summary

До Sprint 4 продукт в основном закрывал контентный сценарий: поиск -> просмотр рецепта/статьи -> избранное / shopping list / paywall.

После Sprint 4 ключевой сценарий расширяется до:
поиск/каталог -> рецепт -> add to planner -> week plan -> nutrient summary -> shopping list -> conversion/retention.

Это напрямую поддерживает success metrics из ТЗ:
- subscription conversion
- retention D7 / D30
- activation: search -> recipe -> action【29:0†TZ_Healthy_Food_Platform_RU_v1.pdf†L18-L19】

---

## 5. Роли и продуктовые права

| Capability | Guest | User | Premium | Admin |
|---|---|---:|---:|---:|
| Публичные рецепты и статьи | Yes | Yes | Yes | Yes |
| Recipe scaling display | Session-level | Saved pref | Saved pref | Yes |
| Базовый shopping list | Limited / prompt | Yes | Yes | Operational only |
| Preferences | No | Yes | Yes | Vocabulary / translation ops only |
| Planner | No | No | Yes | Operational visibility only |
| Nutrient summary | No | No | Yes | Operational visibility only |
| Aggregated planner shopping list | No | No | Yes | Operational visibility only |
| Translation / SEO / content ops | No | No | No | Yes |

Опора на ТЗ:
- User = избранное, shopping list, настройки
- Premium = meal planner, расширенные фильтры, экспорт/шеринг
- Admin/Editor = управление рецептами/статьями/переводами/тегами【29:0†TZ_Healthy_Food_Platform_RU_v1.pdf†L21-L25】

---

## 6. Пользовательские сегменты

### 6.1 Guest
Читает публичный контент, видит ценность planner, но не получает premium functionality.

### 6.2 Registered User
Использует account/preferences, shopping list, избранное, но planner остаётся paywalled.

### 6.3 Premium User
Получает planner, nutrient summary, planner-generated shopping aggregation и full V1 experience.

### 6.4 Admin/Editor
Не является конечным пользователш8ма пордукта; отвечает за content, translations, moderation and ops.

---

## 7. Core user stories

### Planner
1. Как Premium user, я хочу открыть недельный календарь, чтобы запланировать питание на неделю.
2. Как Premium user, я хочу добавлять рецепты в breakfast/lunch/dinner/snacks, чтобы собрать рацион.
3. Как Premium user, я хочу менять рецепт или удалять его из слота, чтобы редактировать план.
4. Как Premium user, я хочу видеть nutrient summary по дню и неделе, чтобы сверяться с целью питания.
5. Как Premium user, я хочу собрать shopping list из planner, чтобы закупиться на неделю.

### Preferences / onboarding
6. Как User/Premium, я хочу пройти onboarding после регистрации, чтобы задать goal, preferences, allergies, language и units【29:2†TZ_Healthy_Food_Platform_RU_v1.pdf†L10-L14】.
7. Как User/Premium, я хочу потом редактировать эти настройки в account.

### Units
8. Как любой пользователь, я хочу видеть ингредиенты и количества в понятной системе единиц.
9. Как User/Premium, я хочу сохранить preferred unit system, чтобы рецепты/planner/shopping list были консистентными.

### Paywall / conversion
10. Как non-premium user, я хочу понимать ценность planner и иметь понятный путь к апгрейду.
11. Как Premium-converted user, я хочу сразу попасть в полезный planner scenario после апгрейда.

### SEO / discoverability
12. Как поисковая система, я хочу получать корректный schema/hreflang/sitemap output для indexable routes.

---

## 8. Functional requirements delta

### 8.1 Meal Planner (Premium)
ТЗ требует:
- onboarding + meal planner (premium)
- planner: weekly calendar (breakfast/lunch/dinner/snacks), nutrient summary, shopping list generation【29:2†TZ_Healthy_Food_Platform_RU_v1.pdf†L10-L15】

#### Requirements
- Planner route: `/planner`【29:0†TZ_Healthy_Food_Platform_RU_v1.pdf†L33-L43】
- View = current selected week
- Week contains 7 days
- Each day supports slots:
  - breakfast
  - lunch
  - dinner
  - snacks
- User can:
  - add recipe to slot
  - replace recipe in slot
  - remove recipe from slot
  - optionally support multiple snacks via internal slot indexing
- UI must show nutrient summary:
  - daily
  - weekly
- Planner can generate shopping list from planned meals
- Planner availability = Premium only, enforced server-side

### 8.2 Shopping list aggregation
ТЗ already allows shopping list and recommends aggregation/export/sharing【29:1†TZ_Healthy_Food_Platform_RU_v1.pdf†L55-L58】.

#### Requirements
- Generated list from planner must aggregate duplicate ingredients where unit families are compatible
- User can check/uncheck items
- User can mark item as pantry/home available
- User can still use existing basic shopping list flows
- Planner-derived aggregation must not break manual or recipe-sourced list items

### 8.3 Metric / imperial
ТЗ recommends metric/imperial and smart rounding for recipe scaling【29:1†TZ_Healthy_Food_Platform_RU_v1.pdf†L51-L53】 and includes metric/imperial in V1 scope【29:2†TZ_Healthy_Food_Platform_RU_v1.pdf†L59-L61】.

#### Requirements
- Display unit system supports metric and imperial
- User preference persists for authenticated users
- Guest may use session-level preference
- Affected surfaces:
  - recipe details
  - servings scaling output
  - planner-linked recipe display
  - shopping list display

### 8.4 Onboarding + preferences
ТЗ:
- account preferences: language, units, diets/allergies, goals【29:3†TZ_Healthy_Food_Platform_RU_v1.pdf†L27-L31】
- onboarding: goal, preferences, allergies, language, ideally units【29:2†TZ_Healthy_Food_Platform_RU_v1.pdf†L10-L14】

#### Requirements
- After registration, user sees onboarding prompt
- Onboarding captures:
  - nutrition goal
  - diet preferences
  - allergies
  - language
  - unit system
- Completion status is stored
- User can skip and return later
- Same values editable in account settings

### 8.5 SEO V1
ТЗ:
- schema.org Recipe/Article, sitemap.xml, hreflang, OG, CWV【29:2†TZ_Healthy_Food_Platform_RU_v1.pdf†L41-L42】
- V1 includes schema + hreflang + sitemap【29:2†TZ_Healthy_Food_Platform_RU_v1.pdf†L59-L61】

#### Requirements
- Public recipe pages expose Recipe schema
- Public article pages expose Article schema
- Locale-aware canonical + hreflang for EN/FR/DE/ES/IT
- Sitemap includes valid public indexable routes only
- Brand metadata baseline must use Nourivo consistently

### 8.6 Analytics V1
ТЗ requires events for search / recipes / planner / paywall / checkout【29:2†TZ_Healthy_Food_Platform_RU_v1.pdf†L41-L42】.

#### Requirements
- Track planner entry and planner actions
- Track paywall exposures
- Track checkout start
- Track planner-generated shopping list event
- Preserve privacy; no sensitive payloads

---

## 9. Key user flows

### 9.1 Recipe -> Planner (Premium)
1. User opens recipe
2. Sees add-to-planner CTA
3. If Premium:
   - selects day + meal slot
   - recipe added to planner
   - summary refreshes
4. If not Premium:
   - sees paywall
   - server still blocks planner APIs

### 9.2 Planner week flow
1. Premium user opens `/planner`
2. Current week loads
3. User adds or edits meals
4. Day/week nutrients update
5. User generates shopping list
6. Aggregated list becomes available in shopping-list surface

### 9.3 Registration -> Onboarding
1. User signs up
2. Lands on onboarding prompt
3. Sets goal, preferences, allergies, language, units
4. Preferences persist
5. User proceeds into product
6. For non-premium user, planner remains upsell surface

### 9.4 Paywall -> Conversion
1. User hits planner CTA or planner route
2. Sees premium value framing
3. Starts checkout
4. On successful entitlement activation, planner opens
5. User completes first planner action

---

## 10. UX rules and states

### 10.1 Planner
States:
- loading
- success
- empty week
- save error
- summary error
- gated non-premium
- guest auth/paywall

### 10.2 Preferences
States:
- first-run onboarding
- edit mode in account
- save success
- validation error
- network error

### 10.3 Shopping list
States:
- list with items
- no items
- planner items absent
- aggregation result
- update error

### 10.4 Recipe page
States:
- unit toggle
- servings scaling
- add to planner success
- add to shopping list success
- gated planner CTA for non-premium

---

## 11. Product rules / business rules

1. Premium gating is not cosmetic. Premium data access must be blocked on the server.
2. Planner data belongs to the current user only.
3. Unit preference must be applied consistently across recipe/planner/shopping list surfaces.
4. Aggregation must not merge incompatible unit families.
5. Onboarding does not permanently block product use.
6. Public SEO output applies only to public pages.
7. Any feature beyond Sprint 4 scope must be marked `Proposal`.

---

## 12. Non-functional expectations inside PRD

The ТЗ includes NFRs as requirements, not optional improvements:
- mobile-first
- password hashing
- XSS/CSRF protection
- webhook reliability
- A11y
- legal pages【29:2†TZ_Healthy_Food_Platform_RU_v1.pdf†L43-L45】

Product implication:
- planner must work on mobile
- paywall and onboarding must be accessible
- conversion path must remain reliable under billing/webhook delays

---

## 13. Success metrics for Sprint 4

### Primary
- planner adoption rate among Premium users
- paywall -> checkout start rate
- upgrade -> first planner action rate
- planner -> shopping list generation rate

### Secondary
- improvement in activation path completion
- retention lift among Premium users
- preferences completion rate

### Guardrails
- no drop in recipe/shopping-list core usability
- no SEO regressions on public routes
- no entitlement regressions

---

## 14. Acceptance criteria

Sprint 4 PRD delta is accepted when:
1. Planner requirements match the ТЗ exactly for weekly calendar, breakfast/lunch/dinner/snacks, nutrient summary and shopping list generation【29:2†TZ_Healthy_Food_Platform_RU_v1.pdf†L10-L15】.
2. V1 scope reflects planner + nutrients + shopping aggregation + metric/imperial + SEO schema/hreflang/sitemap【29:2†TZ_Healthy_Food_Platform_RU_v1.pdf†L59-L61】.
3. Roles Guest / User / Premium / Admin are respected【29:0†TZ_Healthy_Food_Platform_RU_v1.pdf†L21-L25】.
4. Premium gating is explicitly server-side.
5. EN/FR/DE/ES/IT remain supported【29:5†TZ_Healthy_Food_Platform_RU_v1.pdf†L11-L12】.
6. SEO/analytics/NFR expectations are captured from the ТЗ【29:2†TZ_Healthy_Food_Platform_RU_v1.pdf†L41-L45】.
7. Out-of-scope explicitly excludes V2 and adjacent enhancements.

---

## 15. Open product assumptions

- Planner-generated shopping list aggregation is treated as Premium-derived capability because planner itself is Premium and tariff differentiation already elevates aggregation/export/sharing over the basic shopping list【29:2†TZ_Healthy_Food_Platform_RU_v1.pdf†L25-L30】.
- Multiple snacks per day are allowed via internal slot index; this is a modeling choice, not a scope change.
- SEO scope concerns public routes only; authenticated planner/account surfaces are not target landing pages.

---

## 16. Next handoff

After PRD approval:
- A2: lock Architecture / ADR delta
- A3: derive data model delta
- A4: define API contracts
- A6: map UI states
- A8/A9/A10: derive SEO, analytics and QA gates from this PRD
