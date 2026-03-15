# Sprint 5 API / Domain Contracts — Pantry, Substitutions, Autoplan

Status: Draft contract for A4/A9/A10  
Related issue: #165

---

## 1. Contract rules

- All endpoints are versioned under `/api/v1`.
- Authenticated ownership is required for all pantry operations.
- Premium entitlement is required for all autoplan operations and must be enforced server-side.
- Responses must be localization-safe and avoid PII in analytics payloads.
- Error shapes should remain plain and stable.

Suggested common error shape:
```json
{
  "error": {
    "code": "forbidden",
    "message": "Premium subscription required"
  }
}
```

---

## 2. Pantry contracts

### 2.1 GET `/api/v1/pantry/items`
Returns the caller's pantry items.

Auth:
- User or Premium required
- Guest denied

Query params:
- `cursor` optional
- `limit` optional
- `ingredientId` optional normalized filter
- `inStock` optional boolean

Response 200:
```json
{
  "items": [
    {
      "id": "pantry_item_123",
      "ingredientId": "ingredient_apple",
      "displayName": "Apple",
      "quantity": 4,
      "unit": "piece",
      "note": null,
      "updatedAt": "2026-03-15T00:00:00.000Z"
    }
  ],
  "nextCursor": null
}
```

### 2.2 POST `/api/v1/pantry/items`
Creates a pantry item.

Body:
``json
{
  "ingredientId": "ingredient_apple",
  "quantity": 4,
  "unit": "piece",
  "note": "for breakfasts"
}
```

Rules:
- `ingredientId` must resolve to a normalized ingredient
- quantity must be positive
- unit must be compatible with the ingredient/unit family rules

Response 201:
``json
{
  "item": {
    "id": "pantry_item_123",
    "ingredientId": "ingredient_apple",
    "displayName": "Apple",
    "quantity": 4,
    "unit": "piece",
    "note": "for breakfasts"
  }
}
```

### 2.3 PATCH `/api/v1/pantry/items/{itemId}`
Updates pantry item fields owned by current user.

### 2.4 DELETE `/api/v1/pantry/items/{itemId}`
Deletes pantry item owned by current user.

Response 204: no body

### 2.5 POST `/api/v1/pantry/import-from-shopping-list`
Creates or updates pantry items from selected shopping-list items.

Body:
``json
{
  "shoppingListItemIds": ["sli_1", "sli_2"],
  "mode": "merge"
}
```

Rules:
- only user-owned shopping-list items may be imported
- merge behavior must be deterministic
- incompatible unit families must not be silently merged

Response 200:
```json
{
  "imported": 2,
  "updated": 1,
  "created": 1
}
```

---

## 3. Substitution contracts

### 3.1 GET `/api/v1/substitutions`
Returns substitutions for an ingredient within optional recipe context.

Auth:
- public-safe for published content contexts
- no draft/admin content exposure

Query params:
- `ingredientId` required
- `recipeId` optional
- `locale` optional

Response 200:
``json
{
  "ingredientId": "ingredient_milk",
  "items": [
    {
      "id": "sub_oat_milk",
      "label": "Oat milk",
      "reason": "dairy-free alternative",
      "rank": 1,
      "notes": null
    },
    {
      "id": "sub_soy_milk",
      "label": "Soy milk",
      "reason": "high-protein alternative",
      "rank": 2,
      "notes": "flavor may differ"
    }
  ]
}
```

Rules:
- ordered, deterministic output
- locale-aware labels with fallback
- may return empty list for unsupported ingredients

### 3.2 POST `/api/v1/substitutions/apply`
Optional helper endpoint for future UI flows where a chosen substitution affects derived ingredient views but does not rewrite canonical recipe content.

Auth:
- authenticated user optional for persisted user-specific flows
- may stay unimplemented until S5-05/S5-06, but contract is reserved

Body:
``jcon
{
  "recipeId": "recipe_123",
  "ingredientId": "ingredient_milk",
  "substitutionId": "sub_oat_milk"
}
```

Response 200:
``json
{
  "applied": true,
  "ingredientId": "ingredient_milk",
  "substitutionId": "sub_oat_milk"
}
```

---

## 4. Autoplan contracts

### 4.1 POST `/api/v1/autoplan/generate`
Generates a deterministic weekly proposal for the signed-in Premium user.

Auth:
- Premium required server-side

Body:
``json
{
  "weekStart": "2026-03-16",
  "slots": ["breakfast", "lunch", "dinner", "snacks"],
  "respectPantry": true,
  "replaceExisting": false
}
```

Rules:
- uses current user preferences and restrictions
- may consider pantry when available
- does not persist planner mutations
- returns rationale summary and conflicts where relevant

Response 200:
```json
{
  "proposalId": "proposal_123",
  "weekStart": "2026-03-16",
  "days": [
    {
      "date": "2026-03-16",
      "slots": [
        {
          "slot": "breakfast",
          "recipeId": "recipe_oatmeal",
          "reasonCodes": ["matches_preferences", "pantry_supported"]
        }
      ]
    }
  ],
  "summary": {
    "recipesUsed": 12,
    "pantryCoveragePct": 42
  },
  "conflicts": []
}
```

Errors:
- `401 unauthenticated`
- `403 premium_required`
- `409 planner_conflict` when requested generation mode is incompatible with current state
- `422 invalid_request`

### 4.2 POST `/api/v1/autoplan/apply`
Applies a previously generated proposal into planner.

Auth:
- Premium required server-side

Body:
``json
{
  "proposalId": "proposal_123",
  "mode": "fill_empty_only"
}
```

Rules:
- persists through planner domain logic
- ownership and week validation required
- partial apply must be explicit in response
- should remain idempotent for repeated apply attempts on same proposal + mode where feasible

Response 200:
``json
{
  "applied": 10,
  "skipped": 2,
  "weekStart": "2026-03-16"
}
```

---

## 5. Analytics hooks

Expected event family:
- `pantry_item_added`
- `pantry_item_removed`
- `substitution_viewed`
- `substitution_applied`
- `autoplan_started`
- `autoplan_generated`
- `autoplan_applied`

Payload guardrails:
- no raw allergy text
- no email
- no payment data
- only stable ids / booleans / counts / role-safe flags

---

## 6. QA/security notes

- Pantry: verify user ownership on every read/write path
- Substitutions: verify published-only exposure for public requests
- Autoplan: verify Premium denial on direct endpoint access
- Regression: verify planner week load/add/remove/shopping aggregation are unaffected
