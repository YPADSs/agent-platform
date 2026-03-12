# Planner contract — Sprint 4 V1 groundwork

Related issue: #139, #140

This document fixes the minimum server contract for planner access before the weekly UX, shopping list aggregation, and analytics layers are implemented.

## Access policy

Planner is a **consumer Premium feature**.

### Principal behavior
- Guest: `401`
- Authenticated non-premium user: `403`
- Premium user: allowed
- Admin without active premium entitlement: `403` on consumer planner routes
- Admin-specific content operations remain separate and are not part of planner consumer routes

### Rule
Server-side entitlement is authoritative. UI locks, paywalls, or hidden buttons are not sufficient protection.

## Current planner endpoints

### `GET /api/v1/planner/weeks/[weekStart]`
Returns planner week data for the authenticated, premium-entitled user.

Current shape:
```json
{
  "week": {
    "weekStart": "2026-03-09T00:00:00.000Z",
    "items": [
      {
        "id": "meal_plan_item_id",
        "date": "2026-03-10T00:00:00.000Z",
        "slot": "breakfast",
        "slotIndex": 1,
        "servings": 1,
        "recipe": {
          "id": "recipe_id",
          "slug": "recipe-slug",
          "title": "Recipe title"
        }
      }
    ],
    "summary": {
      "totals": {
        "calories": 780,
        "protein_g": 56,
        "fat_g": 30,
        "carbs_g": 68
      },
      "completeness": {
        "hasMissingNutrition": false,
        "missingItemCount": 0,
        "isPartial": false
      }
    },
    "warnings": []
  }
}
```

### `PUT /api/v1/planner/weeks/[weekStart]`
Upserts a planner item for the authenticated, premium-entitled user.

Required request body fields:

```json
{
  "date": "2026-03-10",
  "slot": "breakfast",
  "slotIndex": 1,
  "recipeId": "recipe_id",
  "servings": 1
}
```

Validation rules:
- `weekStart` must be a valid ISO date
- `date` must be inside the addressed week
- `slot` must be one of `breakfast | lunch | dinner | snack`
- `recipeId` must be a non-empty string
- `slotIndex` and `servings` must resolve to positive integers

### `DELETE /api/v1/planner/items/[itemId]`
Deletes a planner item owned by the authenticated, premium-entitled user.

### `GET /api/v1/planner/weeks/[weekStart]/shopping-list`
Returns an aggregated, unit-aware shopping list for the planner week.

Shape:
```json
{
  "shoppingList": {
    "weekStart": "2026-03-09T00:00:00.000Z",
    "unitSystem": "metric",
    "items": [
      {
        "ingredientKey": "olive oil::tbsp",
        "displayName": "Olive oil",
        "quantity": 3,
        "unit": "tbsp",
        "category": null,
        "sourceCount": 2,
        "sourceRefs": [
          {
            "mealPlanItemId": "item_1",
            "recipeId": "recipe_1",
            "day": "2026-03-10",
            "slot": "breakfast"
          }
        ],
        "mergeStatus": "merged"
      }
    ],
    "warnings": []
  }
}
```

## Reserved contract boundaries

- week-level summary is kept to calories, protein, fat, and carbs for V1
- warnings cover missing nutrition, unavailable recipes, and unsafe unit conversions
- aggregation merges only by name + normalized unit family, without aggressive alias logic
- unit propagation is display-oriented based on user preferences, best-effort only

## Edge cases fixed by this groundwork

- direct API access by authenticated non-premium users must fail with `403`
- admin role alone must not unlock consumer planner routes
- planner access checks must remain server-side and shared
- recipe fallbacks may sinthesize nutrition/ingredients until content model is deeperly normalized
