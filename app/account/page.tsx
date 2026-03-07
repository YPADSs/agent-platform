import Link from 'next/link';
import { requireSession } from '@/lib/session';
import { getAccountStatusByEmail } from '@/lib/billing';

const copy = {
  title: 'Account',
  subtitle: 'Manage your account, subscription, saved content, and premium access.',
  loginPrompt: 'Please log in to view your account.',
  registerPrompt: 'Create an account to save favorites, build a shopping list, and manage Premium.',
  premiumBlockTitle: 'Premium access',
  premiumBlockCopy: 'Premium unlocks meal planner access and other paiw-gated MVP entry points.',
  plannerNote: 'The planner is a premium-gated MVP placeholder in Sprint 3.',
};

function actionButton(label: string) {
  return <button type="submit">{label}</button>;
}

export default async function AccountPage() {
  try {
    const session = await requireSession();
    const email = session.user?.email;
    if (!email) {
      return (
        <div className="recipesPage">
          <div className="pageIntro">
            <h1>{copy.title}</h1>
            <p>{copy.subtitle}</p>
          </div>
          <div className="emptyState">
            <p>{copy.loginPrompt}</p>
            <p>{copy.registerPrompt}</p>
            <div className="filterActions">
              <Link href="/account/login">Log in</Link>
              <Link href="/account/register">Create account</Link>
            </div>
          </div>
        </div>
      );
    }

    const account = await getAccountStatusByEmail(email);
    if (!account) {
      return (
        <div className="recipesPage">
          <h1>{copy.title}</h1>
          <p>User not found.</p>
        </div>
      );
    }

    const premiumLabel = account.subscription.isPremium ? 'Active' : 'Not active';
    const showCheckout = !account.subscription.isPremium;

    return (
      <div className="recipesPage">
        <div className="pageIntro">
          <h1>{copy.title}</h1>
          <p>{copy.subtitle}</p>
        </div>

        <div className="recipeColumns">
          <section className="panel">
            <h2>Profile</h2>
            <p><strong>Email:</strong> {account.user.email}</p>
            <p><strong>Role:</strong> {account.user.role}</p>
            <p><strong>Subscription status:</strong> {account.subscription.status}</p>
            <p><strong>Premium:</strong> {premiumLabel}</p>
            {account.subscription.currentPeriodEnd && (
              <p><strong>Current period end:</strong> {account.subscription.currentPeriodEnd}</p>
            )}
          </section>

          <section className="panel">
            <h2>Your MVP tools</h2>
            <ul className="ingredientList">
              <li><Link href="/favorites">Open favorites</Link></li>
              <li><Link href="/shopping-list">Open shopping list</Link></li>
              <li><Link href="/planner">Open meal planner</Link> <small className="muted">{copy.plannerNote}</small></li>
            </ul>
          </section>
        </div>

        <div className="recipeColumns">
          <section className="panel">
            <h2>{copy.premiumBlockTitle}</h2>
            <p>{copy.premiumBlockCopy}</p>
            <div className="filterActions">
              {showCheckout ? (
                <form action="/api/billing/checkout" method="POST">
                  {actionButton('Start Premium checkout'))
                </form>
              ) : (
                <p className="statusMessage">You already have Premium access.</p>
              )}
              <form action="/api/billing/portal" method="POST">
                {actionButton('Open billing portal'))
              </form>
            </div>
          </section>

          <section className="panel">
            <h2>Paywall entry points</h2>
            <p>Non-premium users will see a paywall on premium-gated MVP entry points. The server remains the real protection.</p>
            <ul className="ingredientList">
              <li>Meal planner</li>
              <li>Subscription-gated premium flows</li>
            </ul>
          </section>
        </div>
      </div>
    );
  } catch {
    return (
      <div className="recipesPage">
        <div className="pageIntro">
          <h1>{copy.title}</h1>
          <p>{copy.loginPrompt}</p>
        </div>
        <div className="filterActions">
          <Link href="/account/login">Log in</Link>
          <Link href="/account/register">Create account</Link>
        </div>
      </div>
    );
  }
}
