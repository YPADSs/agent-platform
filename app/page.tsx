import Link from 'next/link';

type Props = {
  params?: {
    locale?: string;
  };
};

function withLocale(locale: string | undefined, path: string) {
  return locale ? `/${locale}${path}` : path;
}

export default function HomePage({ params }: Props) {
  const locale = params?.locale;

  return (
    <div className="recipesPage">
      <div className="pageIntro">
        <h1>Healthy Food Platform</h1>
        <p>
          Explore recipes, read healthy eating articles, save favorites, build a
          shopping list, and manage Premium from your account.
        </p>
      </div>

      <div className="recipeColumns">
        <section className="panel">
          <h2>Explore MVP flows</h2>
          <ul className="ingredientList">
            <li>
              <Link href={withLocale(locale, '/recipes')}>Browse recipes</Link>
            </li>
            <li>
              <Link href={withLocale(locale, '/articles')}>Browse articles</Link>
            </li>
            <li>
              <Link href={withLocale(locale, '/favorites')}>Open favorites</Link>
            </li>
            <li>
              <Link href={withLocale(locale, '/shopping-list')}>
                Open shopping list
              </Link>
            </li>
          </ul>
        </section>

        <section className="panel">
          <h2>Account & Premium</h2>
          <p>
            Use the Account area to log in, view subscription status, start
            checkout, or open the billing portal.
          </p>
          <div className="filterActions">
            <Link href={withLocale(locale, '/account')}>Go to Account</Link>
            <Link href={withLocale(locale, '/planner')}>Open Premium planner</Link>
          </div>
          <p className="muted">
            Premium planning is available from your account and enforced on the
            server.
          </p>
        </section>
      </div>
    </div>
  );
}
