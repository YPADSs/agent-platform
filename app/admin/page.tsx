import Link from 'next/link';
import { SubscriptionStatus } from '@prisma/client';
import { getPrisma } from '@/lib/prisma';
import { requireSession } from '@/lib/session';

type AdminPageProps = {
  params?: { locale?: string };
};

function withLocale(locale: string | undefined, path: string) {
  return locale ? `/${locale}${path}` : path;
}

export default async function AdminPage({ params }: AdminPageProps) {
  const locale = params?.locale;

  try {
    const session = await requireSession();
    const role = (session.user as { role?: string } | undefined)?.role ?? 'USER';

    if (role !== 'ADMIN') {
      return (
        <div className="recipesPage">
          <div className="pageIntro">
            <p className="eyebrow">Admin</p>
            <h1>Admin access required.</h1>
            <p>This dashboard is reserved for launch operations and internal monitoring.</p>
          </div>
          <div className="filterActions">
            <Link href={withLocale(locale, '/account')} className="buttonPrimary">
              Back to account
            </Link>
          </div>
        </div>
      );
    }

    const prisma = getPrisma();
    const [
      users,
      premiumSubscribers,
      recipes,
      articles,
      favorites,
      shoppingItems,
      pantryItems,
      mealPlans,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.subscription.count({
        where: {
          status: {
            in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PAST_DUE],
          },
        },
      }),
      prisma.recipe.count(),
      prisma.article.count(),
      prisma.favorite.count(),
      prisma.shoppingListItem.count(),
      prisma.pantryItem.count(),
      prisma.mealPlan.count(),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 6,
        select: { email: true, role: true, createdAt: true },
      }),
    ]);

    return (
      <div className="dashboardPage">
        <div className="pageIntro">
          <p className="eyebrow">Admin</p>
          <h1>Launch dashboard</h1>
          <p>
            Monitor product readiness, content coverage, and live user activity before and
            after launch.
          </p>
        </div>

        <div className="recipeGrid">
          <section className="panel">
            <h2>Accounts</h2>
            <p><strong>{users}</strong> total users</p>
            <p><strong>{premiumSubscribers}</strong> Premium subscribers</p>
          </section>
          <section className="panel">
            <h2>Content</h2>
            <p><strong>{recipes}</strong> recipe records</p>
            <p><strong>{articles}</strong> article records</p>
          </section>
          <section className="panel">
            <h2>Usage signals</h2>
            <p><strong>{favorites}</strong> favorites saved</p>
            <p><strong>{shoppingItems}</strong> shopping list items</p>
            <p><strong>{pantryItems}</strong> pantry items</p>
            <p><strong>{mealPlans}</strong> meal plans</p>
          </section>
        </div>

        <section className="panel">
          <h2>Recent users</h2>
          <ul className="ingredientList">
            {recentUsers.map((user) => (
              <li key={`${user.email}-${user.createdAt.toISOString()}`}>
                <strong>{user.email}</strong>
                <span className="muted">
                  {user.role} • joined {user.createdAt.toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <h2>Release checklist</h2>
          <ul className="ingredientList">
            <li>Confirm production env vars for database, auth, Stripe, and site URL.</li>
            <li>Verify billing checkout and portal after secrets are configured.</li>
            <li>Smoke test planner, shopping list, pantry import, and account flows on production.</li>
            <li>Monitor Netlify deploy health after merge to main.</li>
          </ul>
        </section>
      </div>
    );
  } catch {
    return (
      <div className="recipesPage">
        <div className="pageIntro">
          <p className="eyebrow">Admin</p>
          <h1>Log in to continue.</h1>
          <p>The admin dashboard requires an authenticated admin account.</p>
        </div>
        <div className="filterActions">
          <Link href={withLocale(locale, '/account/login')} className="buttonPrimary">
            Log in
          </Link>
        </div>
      </div>
    );
  }
}
