import Link from 'next/link';
import { requirePremium } from '@/lib/premium';
import { requireSession } from '@/lib/session';
import { getUserPreferencesByEmail } from '@/lib/preferences';

export default async function PlannerPage() {
  let preferences : Awaited<ReturnType<typeof getUserPreferencesByEmail>> | null = null;

  try {
    const session = await requireSession();
    const email = session.user?.email;
    if (email) {
      preferences = await getUserPreferencesByEmail(email);
    }
    await requirePremium();
  } catch (err) {
    const showOnboardingCta =
      preferences && preferences.onboardingStatus !== 'completed';

    return (
      <div className="recipesPage">
        <h1>Meal Planner (Premium)</h1>
        <p>This feature requires Premium. Server-side gating is enforced.</p>
        <div className="filterActions">
          <Link href="/account">Go to Account</Link>
          <Link href="/account/onboarding">{showOnboardingCta ? 'Complete Sprint 4 setup' : 'Review setup'}</Link>
        </div>
      </div>
    );
  }

  const showOnboardingCallout = preferences && preferences.onboardingStatus !== 'completed';

  return (
    <div className="recipesPage">
      <h1>Meal Planner (Premium)</h1>
      <p>Premium access confirmed (server-side).</p>
      {showOnboardingCallout ? (
        <section className="panel">
          <h2>Complete your core setup</h2>
          <p>Confirm your language, units, and goal before you move into the full weekly planner experience.</p>
          <Link href="/account/onboarding">Open onboarding</Link>
        </section>
      ) : null}
    </div>
  );
}
