import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ViewTracker from '@/components/ViewTracker';
import RecipeActions from '@/components/RecipeActions';
import RecipeSubstitutions from '@/components/RecipeSubstitutions';
import { getRecipeDetail } from '@/lib/recipes';
import {
  getAbsoluteUrl,
  getContentDetailAlternates,
  getContentDetailCanonical,
} from '@/lib/seo';

type RecipeDetailPageProps = {
  params: { slug: string };
  searchParams?: { servings?: string };
};

type RecipeMetadataProps = {
  params: { slug: string };
};

function parseServings(value?: string): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 20) {
    return undefined;
  }
  return parsed;
}

export async function generateMetadata({
  params,
}: RecipeMetadataProps): Promise<Metadata> {
  const recipe = await getRecipeDetail(params.slug);

  if (!recipe) {
    return {
      title: 'Recipe not found',
      robots: { index: false, follow: false },
    };
  }

  const canonical = getContentDetailCanonical('recipes', recipe.slug);

  return {
    title: recipe.title,
    description: recipe.description,
    alternates: {
      canonical,
      languages: getContentDetailAlternates('recipes', recipe.slug),
    },
    openGraph: {
      title: recipe.title,
      description: recipe.description,
      url: canonical,
      type: 'article',
    },
  };
}

export default async function RecipeDetailPage({
  params,
  searchParams,
}: RecipeDetailPageProps) {
  const servings = parseServings(searchParams?.servings);
  const recipe = await getRecipeDetail(params.slug, servings);

  if (!recipe) return notFound();

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    description: recipe.description,
    url: getAbsoluteUrl(`/recipes/${recipe.slug}`),
  };

  return (
    <>
      <ViewTracker kind="recipe" slug={recipe.slug} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <article className="recipeDetail">
        <header className="recipeHero">
          <p className="badge">{recipe.mealType}</p>
          <h1>{recipe.title}</h1>
          <p>{recipe.description}</p>
        </header>

        <div className="recipeMetaGrid">
          <section className="panel">
            <h2>Nutrition</h2>
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
          </section>

          <section className="panel">
            <h2>Servings &amp; scaling</h2>
            <p className="muted">
              The ingredient quantities below are scaled to {recipe.servings} serving
              {recipe.servings === 1 ? '' : 's'}.
            </p>
            <form method="GET" className="servingsForm">
              <label className="field">
                <span>Servings</span>
                <input
                  name="servings"
                  type="number"
                  min={1}
                  max={20}
                  defaultValue={recipe.servings}
                  aria-label="Recipe servings"
                />
              </label>
              <button type="submit">Update</button>
            </form>
          </section>
        </div>

        <RecipeActions slug={recipe.slug} servings={recipe.servings} />

        <div className="recipeColumns">
          <section className="panel">
            <h2>Ingredients</h2>
            <ul className="ingredientList">
              {recipe.ingredients.map((ingredient) => (
                <li key={`${ingredient.name}-${ingredient.text}`}>
                  <span>{ingredient.text}</span>
                  {!ingredient.scalable ? <small>Fixed amount</small> : null}
                </li>
              ))}
            </ul>
          </section>

          <RecipeSubstitutions
            ingredients={recipe.ingredients.map((ingredient) => ({
              name: ingredient.name,
              text: ingredient.text,
            }))}
          />

          <section className="panel">
            <h2>Method</h2>
            <ol className="stepsList">
              {recipe.steps.map((step) => (
                <li key={step.order}>{step.text}</li>
              ))}
            </ol>
          </section>
        </div>
      </article>
    </>
  );
}
