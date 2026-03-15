import Link from 'next/link';
import EventTracker from '@/components/EventTracker';
import PlannerCalendar from '@/components/PlannerCalendar';
import { requirePremium } from '@/lib/premium';
import { requireSession } from '@/lib/session';
import { getUserPreferencesByEmail } from '@/lib/preferences';
import { withLocale } from '@/lib/locale-path';

type PlannerPageProps = {
  params?: { locale?: string };
};

export default async function PlannerPage({ params }: PlannerPageProps) {
  const locale = params?.locale;
  let preferences: Awaited<ReturnType<typeof getUserPreferencesByEmail>> | null = null;

  try {
    const session = await requireSession();
    const email = session.user?.email;

    if (email) {
      preferences = await getUserPreferencesByEmail(email);
    }

    await requirePremium();
  } catch {
    const showOnboardingCta = Boolean(
      preferences && preferences.onboardingStatus !== 'completed',
    );

    return (
      <div className="recipesPage">
        <EventTracker
          name="paywall_viewed"
          props={{ surface: 'planner', gatedFeature: 'planner' }}
        />
        <h1>Meal Planner (Premium)</h1>
        <p>This feature requires Premium. Server-side gating is enforced.</p>
        <div className="filterActions">
          <Link href={withLocale(locale, '/account')}>Go to Account</Link>
          <Link href={withLocale(locale, '/account/onboarding')}>
            {showOnboardingCta ? 'Complete Sprint 4 setup' : 'Review setup'}
          </Link>
        </div>
      </div>
    );
  }

  const showOnboardingCallout = Boolean(
    preferences && preferences.onboardingStatus !== 'completed',
  );

  return (
    <div className="recipesPage">
      <EventTracker name="planner_viewed" props={{ surface: 'planner' }} />
      <div className="pageIntro">
        <h1>Meal Planner (Premium)</h1>
        <p>Use your weekly planner, nutrient summary, and shopping list in one place.</p>
      </div>

      {showOnboardingCallout ? (
        <section className="panel">
          <h2>Complete your core setup</h2>
          <p>
            Confirm your goal, language, and units before you rely on the full weekly
            planner experience.
          </p>
          <Link href={withLocale(locale, '/account/onboarding')}>Open onboarding</Link>
        </section>
      ) : null}

      <PlannerCalendar />
    </div>
  );
}
