# S5-04 substitutions migration notes

Related issue: #185

This Sprint 5 slice introduces deterministic substitution rules on top of the normalized ingredient catalog.

## What changes

- adds `IngredientSubstitutionRule` table
- links substitution rules to `IngredientCatalog`
- supports:
  - direct source ingredient substitutions
  - category fallback substitutions
- adds indexes for direct lookup and category fallback lookup
- adds starter curated fixtures wired into `prisma/seed.ts`

## Rollout notes

- apply migration in non-prod first
- run `prisma generate` and migration apply before testing the substitutions API
- run seed after migration if curated starter substitutions are needed in local/dev environments

## Rollback notes

- remove dependent substitution rules before removing the table
- no existing V1 tables are mutated by this slice
- pantry foundation remains intact if substitution layer is rolled back
