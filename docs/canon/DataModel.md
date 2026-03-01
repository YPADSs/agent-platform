# Data Model — v1 (Conceptual)

date: 2026-03-02

Scope: conceptual entities/relationships/constraints for MVP/V1 per ТЗ. Physical DB choice is out-of-scope here.

> Premium gating requirement: subscription/entitlements must be enforceable server-side.

---

## 1) Conventions (shared)
- All tables include: `id` (UUID/ulid), `created_at`, `updated_at`.
- Content entities supporting i18n use `*_translation` tables keyed by `(entity_id, locale)`.
- Locale enum: `en | fr | de | es | it`.
- Slugs: unique per locale for public pages (see SEO doc).

---

## 2) Users & Access

### user
- `id`
- `email` (unique, normalized)
- `password_hash` (never store plaintext)
- `role` (guest/user/premium/admin_editor)  *(guest typically not persisted; may be implicit)*
- `is_active`
- `last_login_at` (optional)

### preference
- `id`
- `user_id` (FK user.id, unique)
- `locale` (enum)
- `units` (metric|imperial) *(desirable per ТЗ)*
- `diet_tags` (array or join table; e.g. vegetarian, keto) *(V1+ for advanced filters)*
- `allergy_tags` (array or join table)
- `nutrition_goal` (optional; e.g. high_protein, weight_loss)
- `onboarding_completed_at` (optional)

### subscription (Stripe)
- `id`
- `user_id` (FK user.id, unique active subscription per user)
- `stripe_customer_id` (unique)
- `stripe_subscription_id` (unique, nullable until subscribed)
- `status` (trialing|active|past_due|canceled|unpaid|incomplete)
- `current_period_end` (timestamp)
- `cancel_at_period_end` (bool)
- `plan_key` (e.g. premium_monthly)
- `last_event_id` (last processed Stripe event id; see webhook idempotency)
- `entitled` (bool snapshot for fast checks) *(derived; keep consistent via webhooks)*

> Constraint: keep an idempotency ledger (see below) to ensure webhook processing is exactly-once logically.

### billing_event (idempotency ledger)
- `id` (can be Stripe `event.id`)
- `provider` (stripe)
- `event_type`
- `received_at`
- `processed_at` (nullable)
- `status` (processed|ignored|failed)
- `payload_hash` (optional)

---

## 3) Content

### recipe
- `id`
- `primary_locale` (enum; typically en)
- `published_status` (draft|review|published)
- `meal_type` (breakfast|lunch|dinner|dessert|snack|soup|drink|salad)
- `calories_kcal` (int)
- `protein_g` / `fat_g` / `carbs_g` (numeric)
- `default_servings` (int)
- `image_url` (optional)
- `created_by` (FK user.id; admin/editor)

#### recipe_translation
- `id`
- `recipe_id` (FK recipe.id)
- `locale` (enum)
- `slug` (unique per locale)
- `title`
- `short_description`
- `steps_markdown` (or structured steps; keep simple for canon)
- `key_takeaways` (optional)

> Unique: (recipe_id, locale). Also unique: (locale, slug).

#### ingredient
- `id`
- `is_active`

#### ingredient_translation
- `id`
- `ingredient_id` (FK ingredient.id)
- `locale` (enum)
- `name` (unique-ish within locale; soft-unique recommended)

#### recipe_ingredient
Join entity between recipe and ingredient.
- `id`
- `recipe_id` (FK recipe.id)
- `ingredient_id` (FK ingredient.id)
- `quantity` (numeric)
- `unit` (string; e.g. g, ml, pcs)
- `is_optional` (bool)
- `note` (optional; e.g. "finely chopped")
- `sort_order` (int)

> Supports recipe scaling UX: store base quantities for `default_servings`, scale proportionally.

### article
- `id`
- `primary_locale`
- `published_status` (draft|review|published)
- `rubric` (master_class|product|other)
- `hero_image_url` (optional)
- `created_by` (FK user.id)

#### article_translation
- `id`
- `article_id` (FK article.id)
- `locale` (enum)
- `slug` (unique per locale)
- `title`
- `content_markdown` (or rich content json)
- `key_takeaways` (optional)
- `sources` (optional)

### tag / category
(Used for filtering, navigation, and SEO.)
- `tag`: `id`, `kind` (category|tag), `created_by`
- `tag_translation`: `tag_id`, `locale`, `slug`, `name` (unique per locale+slug)
- `recipe_tag`: `recipe_id`, `tag_id`
- `article_tag`: `article_id`, `tag_id`

---

## 4) User interactions

### favorite
- `id`
- `user_id` (FK user.id)
- `target_type` (recipe|article)
- `target_id` (FK to recipe/article by polymorphic rule)
- `created_at`

> Unique: (user_id, target_type, target_id)

### shopping_list_item
- `id`
- `user_id` (FK user.id)
- `ingredient_id` (nullable FK ingredient.id)
- `free_text_name` (nullable; used when ingredient_id not present)
- `quantity` (numeric, nullable)
- `unit` (string, nullable)
- `is_pantry` (bool; “have at home”)
- `is_checked` (bool; optional)
- `source_recipe_id` (nullable FK recipe.id)
- `created_at`

> Rule: either `ingredient_id` OR `free_text_name` must be present.

---

## 5) Premium (V1+)

### meal_plan
- `id`
- `user_id` (FK user.id)
- `week_start_date` (date)
- `week_end_date` (date)

> Unique: (user_id, week_start_date)

### meal_plan_item
- `id`
- `meal_plan_id` (FK meal_plan.id)
- `date` (date)
- `slot` (breakfast|lunch|dinner|snack)
- `recipe_id` (FK recipe.id)
- `servings` (int)

> Unique: (meal_plan_id, date, slot)

---

## 6) Query needs (indexes, conceptual)
- Recipe catalog: index on `recipe.meal_type`, `recipe.published_status`
- Search by name/title: full-text index on `recipe_translation.title`, `article_translation.title`
- Ingredient search (1–3 ingredients): index on `recipe_ingredient.ingredient_id` and `recipe_ingredient.recipe_id`
- Favorites: unique composite index as above
- Stripe webhooks: unique index on `billing_event.id` (Stripe event id)

