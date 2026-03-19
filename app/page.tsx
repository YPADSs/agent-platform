import Link from 'next/link';
import { listArticleSummaries } from '@/lib/articles';
import { listRecipeSummaries } from '@/lib/recipes';

export default async function HomePage() {
  const [recipes, articles] = await Promise.all([
    listRecipeSummaries({ limit: 4 }),
    listArticleSummaries({ limit: 4 }),
  ]);

  return (
    <div className="landingPage">
      <section className="landingHero">
        <div className="landingHeroCopy">
          <p className="eyebrow">Meal planning platform</p>
          <h1>Nourivo turns healthy intentions into weekly routines.</h1>
          <p className="lead">
            Plan meals, save credible nutrition content, sync checked groceries into your
            pantry, and keep the whole experience grounded in practical everyday habits.
          </p>
          <div className="heroActions">
            <Link href="/recipes" className="buttonPrimary">
              Explore recipes
            </Link>
            <Link href="/account" className="buttonSecondary">
              Open account
            </Link>
          </div>
          <div className="heroMetrics">
            <div className="heroMetric">
              <strong>V2</strong>
              <span>planner, pantry, shopping, content, account</span>
            </div>
            <div className="heroMetric">
              <strong>5 locales</strong>
              <span>shared navigation and route structure</span>
            </div>
            <div className="heroMetric">
              <strong>Premium-ready</strong>
              <span>billing and paywall flows built into the product</span>
            </div>
          </div>
        </div>

        <div className="heroFeatureCard">
          <div className="heroFeatureHeader">
            <p className="badge">Launch focus</p>
            <h2>What users can do today</h2>
          </div>
          <ul className="featureChecklist">
            <li>Build a week plan and keep meals organized by slot.</li>
            <li>Aggregate shopping needs from the planner into a weekly view.</li>
            <li>Mark bought items and sync them into pantry inventory.</li>
            <li>Save favorites, manage preferences, and upgrade to Premium.</li>
          </ul>
        </div>
      </section>

      <section className="marketingGrid">
        <article className="marketingCard">
          <p className="eyebrow">Planner</p>
          <h2>Weekly structure, not guesswork.</h2>
          <p>
            Weekly calendar planning, nutrition rollups, planner shopping aggregation, and
            autoplan support for quick-start routines.
          </p>
          <Link href="/planner" className="cardLink">
            Open planner
          </Link>
        </article>

        <article className="marketingCard">
          <p className="eyebrow">Pantry</p>
          <h2>Keep the pantry connected to reality.</h2>
          <p>
            Track staples you already have at home and turn checked shopping items into a
            reusable pantry source of truth.
          </p>
          <Link href="/pantry" className="cardLink">
            Open pantry
          </Link>
        </article>

        <article className="marketingCard">
          <p className="eyebrow">Editorial</p>
          <h2>Recipes and guidance that feel productized.</h2>
          <p>
            Real recipe cards, related reading, structured takeaways, and a content layer
            strong enough to present as a polished launch product.
          </p>
          <Link href="/articles" className="cardLink">
            Browse articles
          </Link>
        </article>
      </section>

      <section className="contentShowcase">
        <div className="sectionHeading">
          <div>
            <p className="eyebrow">Featured recipes</p>
            <h2>Quick wins for a healthier week</h2>
          </div>
          <Link href="/recipes" className="buttonGhost">
            View all recipes
          </Link>
        </div>
        <div className="showcaseGrid">
          {recipes.map((recipe) => (
            <article key={recipe.slug} className="showcaseCard">
              <div className="recipeCardHeader">
                <p className="badge">{recipe.mealType}</p>
                <p className="muted">{recipe.servings} servings</p>
              </div>
              <h3>{recipe.title}</h3>
              <p>{recipe.description}</p>
              <p className="muted">
                {recipe.nutrition.calories} kcal / {recipe.nutrition.protein}g protein
              </p>
              <Link href={`/recipes/${recipe.slug}`} className="cardLink">
                Open recipe
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="contentShowcase">
        <div className="sectionHeading">
          <div>
            <p className="eyebrow">Featured reading</p>
            <h2>Nutrition guidance with product context</h2>
          </div>
          <Link href="/articles" className="buttonGhost">
            View all articles
          </Link>
        </div>
        <div className="showcaseGrid">
          {articles.map((article) => (
            <article key={article.slug} className="showcaseCard">
              <p className="badge">{article.category}</p>
              <h3>{article.title}</h3>
              <p>{article.description}</p>
              <Link href={`/articles/${article.slug}`} className="cardLink">
                Open article
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="premiumBanner">
        <div>
          <p className="eyebrow">Premium</p>
          <h2>Unlock planner-led weekly execution.</h2>
          <p>
            Premium connects planner access, faster meal organization, and a more structured
            weekly routine from account to checkout.
          </p>
        </div>
        <div className="heroActions">
          <Link href="/account" className="buttonPrimary">
            Manage subscription
          </Link>
          <Link href="/shopping-list" className="buttonSecondary">
            Review shopping flow
          </Link>
        </div>
      </section>
    </div>
  );
}
