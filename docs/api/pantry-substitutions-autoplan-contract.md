# Pantry + Substitutions + Autoplan contract draft (S5)

Related issue: #179

## Purpose

This document defines the first docs-level API contract for Sprint 5 V2 foundations.

It does **not** introduce implementation code. It aligns API boundaries before data model and UI work.

## Access model

- Pantry endpoints: auth-required (User or Premium)
- Substitution lookup: public read is allowed for recipe context, server remains source of truth
- Autoplan endpoints: Premium-only and server-enforced
- Admin/Editor workflows are not defined in this contract pass

## 1) Pantry

### GET `/api/v1/me/pantry`
Returns the current user's pantry items.

Response draft:

```json
{
  "items": [
    {
      "id": "pan_123",
      "ingredientKey": "chickpeas",
      "displayName": "Chickpeas",
      "quantity": 2,
      "unit": "can",
      "source": "manual",
      "updatedAt": "2026-03-17T14:00:00Z"
    }
  ]
}
```

### POST `/api/v1/me/pantry`
Creates or adds a pantry item.

Request draft:

```json
{
  "ingredientKey": "chickpeas",
  "displayName": "Chickpeas",
  "quantity": 2,
  "unit": "can",
  "source": "manual"
}
```

### PATCH `/api/v1/me/pantry/[itemId]`
Updates quantity, unit, or normalized display metadata for a pantry item.

### DELETE `/api/v1/me/pantry/[itemId]`
Removes a pantry item.

### POST `/api/v1/me/pantry/import`
Marks items into pantry from any supported source flow.

Supported sources for V1:
- manual shopping list item
- planner-aggregated item

- Note: this is an import/sync style action, not free-text pantry intelligence.

## 2) Substitutions

### GET `/api/v1/substitutions?ingredientKey=chickpeas`
Returns deterministic substitution suggestions for an ingredient key.

Response draft:

```json
{
  "ingredientKey": "chickpeas",
  "suggestions": [
    {
      "ingredientKey": "white-beans",
      "displayName": "White beans",
      "reason": "Similar protein/fiber use in salads and bowls",
      "note": "May change texture."
    }
  ]
}
```

The contract must allow an empty `suggestions` array when no curated rule exists.

## 3) Autoplan

### POST `/api/v1/planner/autoplan/generate`
Premium-only. Generates a deterministic suggested plan without mutating the user's existing planner.

Request draft:

 ``json
{
  "weekStart": "2026-03-16",
  "slots": ["breakfast", "lunch", "dinner"],
  "pantryAware": true
}
```

Response draft:

```json
{
  "plan": {
    "weekStart": "2026-03-16",
    "items": [
      {
        "day": "2026-03-16",
        "slot": "lunch",
        "recipeSlug": "green-protein-salad",
        "reason": "matches preferences and re-uses pantry items"
      }
    ]
  },
  "meta": {
    "generatorVersion": "v1-deterministic",
    "pantryAware": true
  }
}
```

### POST `/api/v1/planner/autoplan/apply`
Premium-only. Applies a previously generated plan to the user's planner.

Request draft:

 ``json
{
  "weekStart": "2026-03-16",
  "plan": {
    "items": [
      {
        "day": "2026-03-16",
        "slot": "lunch",
        "recipeSlug": "green-protein-salad"
      }
    ]
  }
}
```

## Error model (draft)

- `401` unauthenticated
- `403` premium-required (autoplan)
- `404` not found (ownership-scoped item)
- `422` validation error
- `500` internal server error

## Analytics first-pass events

- `pantry_item_added`
- `pantry_item_removed`
- `substitution_viewed`
- `substitution_applied`
- `autoplan_started`
- `autoplan_generated`
- `autoplan_applied`

## Notes

- Autoplan generate and autoplan apply are separate by design.
- Substitutions must remain deterministic in this first pass.
- Pantry cannot be treated as a free-form notes system in V1.
