import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="recipesPage">
      <div className="pageIntro">
        <h1>Healthy Food Platform</h1>
        <p>Explore recipes, read healthy eating articles, save favorites, build a shopping list, and manage Premium from your account.</p>
      </div>

      <div className="recipeColumns">
        <section className="panel">
          <h2>Explore MVP flows</h2>
          <ul className="ingredientList">
            <li><Link href="/recipes">Browse recipes</Link></li>
            <li><Link href="/articles">Browse articles</Link></li>
            <li><Link href="/favorites">Open favorites</Link></li>
            <li><Link href="/shopping-list">Open shopping list</Link></li>
          </ul>
        </section>

        <section className="panel">
          <h2>Account & Premium</h2>
          <p>Use the Account area to log in, view subscription status, start checkout, or open the billing portal.</p>
          <div className="filterActions">
            <Link href="/account">Go to Account</Link>
            <Link href="/planner">Open Premium planner</Link>
          </div>
          <p className="muted">Planner is a premium-gated MVP placeholder in Sprint 3.</p>
        </section>
      </div>
    </div>
  );
}
