import Link from 'next/link';
import { requireSession } from '@/lib/session';
import { getAccountStatusByEmail } from '@/lib/billing';
import AccountPreferencesPanel from '@/components/AccountPreferencesPanel';
import { getUserPreferencesByEmail } from '@/lib/preferences';

export default async function AccountPage() {
  try {
    const session = await requireSession();
    const email = session.user?.email;

    if (!email) {
      return (
        <div className="recipesPage">
          <div className="pageIntro">
            <h1>Account</h1>
            <p>Manage your account, subscription, and Premium access.</p>
          </div>
          <div className="emptyState">
            <p>Please log in to view your account.</p>
            <p>Create an account to save favorites, build a shopping list, and manage Premium.</p>
            <div className="filterActions">
              <Link href="/account/login">Log in</Link>
              <Link href="/account/register">Create an account</Link>
            </div>
          </div>
        </div>
      );
    }

    const [account, preferences] = await Promise.all([
      getAccountStatusByEmail(email),
      getUserPreferencesByEmail(email),
    ]);
    if (!account) {
      return (
        <div className="recipesPage">
          <h1>Account</h1>
          <p>User not found.</p>
        </div>
      );
    }

    const premiumLabel = account.subscription.isPremium ? 'Active' : 'Not active';
    const showCheckout = !account.subscription.isPremium;
    const showOnboardingCallout = preferences.onboardingStatus !== 'completed';

    return (
      <div className="recipesPage">
        <div className="pageIntro">
          <h1>Account</h1>
          <p>Manage your account, subscription, saved content, and Premium access.</p>
        </div>

        {showOnboardingCallout ? (
          <section className="panel">
            <h2>Complete your Sprint 4 setup</h2>
            <p>Confirm your goal, language, and units so planner and shopping-list experiences can reuse the same settings.</p>
            <div className="filterActions">
              <Link href="/account/onboarding">Finish onboarding</Link>
            </div>
          </section>
        ) : null}

        <div className="recipeColumns">
          <section className="panel">
            <h2>Profile</h2>
            <p><strong>Email:</strong> {account.user.email}</p>
            <p><strong>Role:</strong> {account.user.role}</p>
            <p><strong>Subscription status:</strong> {account.subscription.status} </p>
            <p><strong>Premium:</strong> {premiumLabel}</p>
            <p><strong>Onboarding:</strong> {preferences.onboardingStatus}</p>
            {account.subscription.currentPeriodEnd ? (
              <p>
                <strong>Current period end:</strong> {account.subscription.currentPeriodEnd}
              </p>
            ) : null}
          </section>

          <AccountPreferencesPanel />
        </div>

        <div className="recipeColumns">
          <section className="panel">
            <h2>MVP tools</h2>
            <ul className="ingredientList">
              <li><Link href="/favorites">Open favorites</Link></li>
              <li><Link href="/shopping-list">Open shopping list</Link></li>
              <li>
                <Link href="/planner">Open meal planner</Link>{' '}<small className="muted">Premium-gated STRINT 4 entry point.</small>
              </li>
              <li><Link href="/account/onboarding">Complete Sprint 4 setup</Link></li>
            </ul>
          </section>

          <section className="panel">
            <h2>Premium access</h2>
            <p>Premium unlocks meal planner access and other paywalled Sprint 4 entry points.</p>
            <div className="filterActions">
              {showCheckout ? (
                <form action="/api/billing/checkout" method="POST">
                  <button type="submit">Start Premium checkout</button>
                </form>
              ) : (
                <p className="statusMessage">You already have Premium access.</p>
              )}
              <form action="/api/billing/portal" method="POST">
                <button type="submit">Open billing portal</button>
              </form>
            </div>
          </section>
        </div>
      </div>
    );
  } catch {
    return (
      <div className="recipesPage">
        <div className="pageIntro">
          <h1>Account</h1>
          <p>Please log in to view your account.</p>
        </div>
        <div className="filterActions">
          <Link href="/account/login">Log in</Link>
          <Link href="/account/register">Create an account</Link>
        </div>
      </div>
    );
  }
}
