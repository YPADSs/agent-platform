# Data Model (Draft) — Entity Inventory

## Users & access
- User
- Preference (language, units, diets, allergies, goals)
- Subscription (Stripe customer, status, plan, period end)

## Content
- Recipe
- RecipeTranslation (locale, title, description, steps, takeaways)
- Ingredient
- IngredientTranslation (locale, name)
- RecipeIngredient (recipe_id, ingredient_id, qty, unit, optional, notes)
- Article
- ArticleTranslation (locale, title, content, takeaways)
- Category / Tag (and translations if needed)

## User interactions
- Favorite (user_id, target_type: recipe|article, target_id)
- ShoppingListItem (user_id, ingredient reference or free-text, qty, unit, checked/pantry flag)

## Premium
- MealPlan (user_id, week range)
- MealPlanItem (meal_plan_id, date, slot: breakfast/lunch/dinner/snack, recipe_id, servings)

## Notes / constraints (draft)
- i18n supported for recipes/articles/ingredients.
- Premium entitlements must be enforceable server-side (subscription snapshot/cache).
