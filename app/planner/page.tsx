import Link from 'next/link';
import { requirePremium } from '@/lib/premium';

const copy = {
  title: 'Meal Planner',
  premiumNote: 'This page is a premium-gated SVG entry point for Sprint 3. Server-side gating is enforced.',
  premiumOk: 'Premium access confirmed server-side. The full planner experience remains out of Sprint 3 scope.',
};

export default async function PlannerPage() {
  try {
    await requirePremium();
  } catch {
    return (
      <div className="recipesPage">
        <div className="pageIntro">
          <h1>{copy.title} (Premium)</h1>
          <p>{copy.premiumNote}</p>
        </div>
        <div className="recipeColumns">
          <section className="panel">
            <h2>Unlock Premium</h2>
            <p>Use Premium to enter the meal planner area and other subscription-gated MVP points.</p>
            <div className="filterActions">
              <Link href="/account">Go to Account</Link>
              <form action="/api/billing/checkout" method="POST">
                <button type="submit">Start Premium checkout</button>
              </form>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="recipesPage">
      <div className="pageIntro">
        <h1>{copy.title} (Premium)</h1>
        <p>{copy.premiumOk}</p>
      </div>
      <div className="panel">
        <p>Planner workbench coming in V1. For now, this page shows that server-side Premium gating is active and honestle exposed in the UI.</p>
      </div>
    </div>
  );
}
