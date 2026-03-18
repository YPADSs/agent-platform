import Link from 'next/link';
import AccountPreferencesPanel from '@/components/AccountPreferencesPanel';
import BillingRedirectButton from '@/components/BillingRedirectButton';
import { getAccountStatusByEmail } from '@/lib/billing';
import { withLocale } from '@/lib/locale-path';
import { getUserPreferencesByEmail } from '@/lib/preferences';
import { requireSession } from '@/lib/session';

type AccountPageProps = {
  params?: { locale?: string };
};

function renderLoggedOut(locale?: string) {
  return (
    <div className="recipesPage">
      <div className="pageIntro">
        <p className="eyebrow">Account</p>
        <h1>Welcome back when you are ready.</h1>
        <p>Sign in to manage preferences, Premium access, planner features, and saved content.</p>
      </div>
      <div className="filterActions">
        <Link href={withLocale(locale, '/account/login')} className="buttonPrimary">
          Log in
        </Link>
        <Link href={withLocale(locale, '/account/register')} className="buttonSecondary">
          Create account
        </Link>
      </div>
    </div>
  );
}

export default async function AccountPage({ params }: AccountPageProps) {
  const locale = params?.locale;

  try {
    const session = await requireSession();
    const email = session.user?.email;

    if (!email) {
      return renderLoggedOut(locale);
    }

    const [account, preferences] = await Promise.all([
      getAccountStatusByEmail(email),
      getUserPreferencesByEmail(email),
    ]);

    if (!account) {
      return renderLoggedOut(locale);
    }

    const isPremium = account.subscription.isPremium;
    const needsOnboarding = preferences.onboardingStatus !== 'completed';
    const role = account.user.role;

    return (
      <div className="dashboardPage">
        <div className="pageIntro">
          <p className="eyebrow">Account</p>
          <h1>Your Nourivo control center.</h1>
          <p>
            Manage your profile, unlock Premium planning, keep preferences consistent, and
            jump into the parts of the product you use every week.
          </p>
        </div>

        {needsOnboarding ? (
          <section className="panel">
            <h2>Finish your setup</h2>
            <p>
              Confirm language, units, and your planning goal so the planner, pantry, and
              shopping experience can stay aligned.
            </p>
            <div className="filterActions">
              <Link href={withLocale(locale, '/account/onboarding')} className="buttonPrimary">
                Complete setup
              </Link>
            </div>
          </section>
        ) : null}

        <div className="recipeMetaGrid">
          <section className="panel">
            <h2>Membership</h2>
            <p>
              <strong>Plan:</strong> {isPremium ? 'Premium' : 'Free'}
            </p>
            <p>
              <strong>Status:</strong> {account.subscription.status}
            </p>
            <p>
              <strong>Role:</strong> {role}
            </p>
            {account.subscription.currentPeriodEnd ? (
              <p>
                <strong>Renews through:</strong>{' '}
                {new Date(account.subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            ) : null}
          </section>

          <section className="panel">
            <h2>Profile</h2>
            <p>
              <strong>Email:</strong> {account.user.email}
            </p>
            <p>
              <strong>Locale:</strong> {preferences.locale.toUpperCase()}
            </p>
            <p>
              <strong>Units:</strong> {preferences.unitSystem}
            </p>
            <p>
              <strong>Onboarding:</strong> {preferences.onboardingStatus}
            </p>
          </section>
        </div>

        <div className="recipeColumns">
          <section className="panel">
            <h2>Premium access</h2>
            <p>
              Premium unlocks planner-led weekly execution, fast meal scheduling, and the
              strongest cross-feature workflow in Nourivo.
            </p>
            <div className="plannerSidebar">
              {!isPremium ? (
                <BillingRedirectButton
                  endpoint="/api/billing/checkout"
                  idleLabel="Start Premium checkout"
                  loadingLabel="Opening checkout..."
                  eventName="checkout_started"
                  eventProps={{ surface: 'account', plan: 'premium' }}
                />
              ) : (
                <p className="statusMessage">Premium is already active on this account.</p>
              )}

              <BillingRedirectButton
                endpoint="/api/billing/portal"
                idleLabel="Open billing portal"
                loadingLabel="Opening billing portal..."
                disabled={!account.subscription.stripeCustomerId}
              />
            </div>
          </section>

          <section className="panel">
            <h2>Quick actions</h2>
            <ul className="ingredientList">
              <li>
                <Link href={withLocale(locale, '/planner')} className="cardLink">
                  Open planner
                </Link>
              </li>
              <li>
                <Link href={withLocale(locale, '/shopping-list')} className="cardLink">
                  Open shopping list
                </Link>
              </li>
              <li>
                <Link href={withLocale(locale, '/pantry')} className="cardLink">
                  Review pantry
                </Link>
              </li>
              <li>
                <Link href={withLocale(locale, '/favorites')} className="cardLink">
                  View favorites
                </Link>
              </li>
              {role === 'ADMIN' ? (
                <li>
                  <Link href={withLocale(locale, '/admin')} className="cardLink">
                    Open admin dashboard
                  </Link>
                </li>
              ) : null}
            </ul>
          </section>
        </div>

        <div className="recipeColumns">
          <AccountPreferencesPanel />

          <section className="panel">
            <h2>Launch notes</h2>
            <p>
              This account surface is already wired into authentication, subscriptions, and
              user preferences. It is the main handoff point into planner, pantry, and
              billing flows.
            </p>
            <p className="muted">
              If your Stripe env vars are missing, checkout and portal routes will stay
              unavailable until production secrets are configured.
            </p>
          </section>
        </div>
      </div>
    );
  } catch {
    return renderLoggedOut(locale);
  }
}
