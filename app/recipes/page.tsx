import Link from 'next/link';
import {listRecipeSummaries} from '@/lib/recipes';
import {withLocale} from '@/lib/locale-path';

type RecipesPageProps = {
  params?: {locale?: string};
  searchParams?: {
    q?: string;
    mealType?: string;
    ingredients?: string;
  };
};

const mealTypeOptions = [
  {value: '', label: 'All meal types'},
  {value: 'breakfast', label: 'Breakfast'},
  {value: 'lunch', label: 'Lunch'},
  {value: 'dinner', label: 'Dinner'},
  {value: 'salad', label: 'Salad'},
  {value: 'soup', label: 'Soup'},
  {value: 'snack', label: 'Snack'},
  {value: 'dessert', label: 'Dessert'},
];

export default async function RecipesPage({params, searchParams}: RecipesPageProps) {
  const locale = params?.locale;
  const q = searchParams?.q?.trim() ?? '';
  const mealType = searchParams?.mealType?.trim() ?? '';
  const ingredients = searchParams?.ingredients?.trim() ?? '';

  const ingredientList = ingredients
    .split(',')
    .map((ingredient) => ingredient.trim())
    .filter(Boolean)
    .slice(0, 3);

  const recipes = await listRecipeSummaries({
    q,
    mealType,
    ingredients: ingredientList,
  });

  return (
    <div className="recipesPage">
      <div className="pageIntro">
        <h1>Recipes</h1>
        <p>
          Search by title, narrow by meal type, or match up to three ingredients to
          find a simple healthy meal fast.
        </p>
      </div>

      <form method="GET" className="recipesFilters">
        <label className="field">
          <span>Search</span>
          <input
            name="q"
            defaultValue={q}
            placeholder="Search recipes"
            aria-label="Search recipes"
          />
        </label>

        <label className="field">
          <span>Meal type</span>
          <select
            name="mealType"
            defaultValue={mealType}
            aria-label="Filter by meal type"
          >
            {mealTypeOptions.map((option) => (
              <option key={option.value || 'all'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field fieldWide">
          <span>Ingredients (1-3, comma separated)</span>
          <input
            name="ingredients"
            defaultValue={ingredients}
            placeholder="tomato, lentils"
            aria-label="Filter by ingredients"
          />
        </label>

        <div className="filterActions">
          <button type="submit">Apply filters</button>
          <Link href={withLocale(locale, '/recipes')}>Reset</Link>
        </div>
      </form>

      <p className="resultsMeta">
        {recipes.length} result{recipes.length === 1 ? '' : 's'}
        {ingredientList.length ? ` - ingredient match: ${ingredientList.join(', ')}` : ''}
      </p>

      {recipes.length ? (
        <ul className="recipeGrid">
          {recipes.map((recipe) => (
            <li key={recipe.slug} className="recipeCard">
              <div className="recipeCardHeader">
                <p className="badge">{recipe.mealType}</p>
                <p className="muted">Servings: {recipe.servings}</p>
              </div>

              <h2>
                <Link href={withLocale(locale, `/recipes/${recipe.slug}`)}>
                  {recipe.title}
                </Link>
              </h2>
              <p>{recipe.description}</p>

              <dl className="nutritionMini">
                <div>
                  <dt>Calories</dt>
                  <dd>{recipe.nutrition.calories}</dd>
                </div>
                <div>
                  <dt>Protein</dt>
                  <dd>{recipe.nutrition.protein}g</dd>
                </div>
                <div>
                  <dt>Fat</dt>
                  <dd>{recipe.nutrition.fat}g</dd>
                </div>
                <div>
                  <dt>Carbs</dt>
                  <dd>{recipe.nutrition.carbs}g</dd>
                </div>
              </dl>

              <p className="muted">
                Ingredients: {recipe.ingredientNames.slice(0, 4).join(', ')}
                {recipe.ingredientNames.length > 4 ? '...' : ''}
              </p>

              <Link
                className="cardLink"
                href={withLocale(locale, `/recipes/${recipe.slug}`)}
              >
                Open recipe
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="emptyState">
          <h2>No recipes matched your filters</h2>
          <p>Try fewer ingredients or remove one of the filters.</p>
        </div>
      )}
    </div>
  );
}
