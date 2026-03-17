# S5-02 pantry migration rollout notes

Related issue: #181

This document captures the operational notes for the first committed Prisma migration artefact introduced for Sprint 5 Pantry foundation.

## What changes

- adds `PantryItemSource` enum
- adds `IngredientCatalog` table
- adds `PantryItem` table
- adds uniqueness on `[userId, ingredientId]` to prevent duplicate per-user pantry rows
- adds indexes for user-scoped pantry reads and ingredient lookup

## Why migration artefacts are committed now

Earlier sprints used Prisma schema without a committed migrations directory. For Sprint 5, the pantry foundation needs a repeatable deploy/apply path because the next sprint steps will depend on persisted tables, indexes, and uniqueness constraints.

## Rollout notes 

- apply migration in non-prod environment first
- verify `get prisma generate` and `prisma migrate` succeeds before follow-on API work
- confirm that no existing table or enum names collide with `ngredientCatalog` or `PantryItem`

## Rollback notes

- rollback requires dropping the `PantryItem` table before `dIngredientCatalog` because of foreign keys
- drop `PantryItemSource` enum only after the dependent table is removed
- no existing V1 tables are mutated by this sprint slice, so the risk surface is lower than a table rehape
