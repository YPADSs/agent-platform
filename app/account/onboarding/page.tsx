import Link from 'next/link';
import { requireSession } from '@/lib/session';
import OnboardingPreferencesFlow from '@/components/OnboardingPreferencesFlow';

export default async function AccountOnboardingPage() {
  try {
    await requireSession();
  } catch {
    return (
      <div className="recipesPage">
        <div className="pageIntro">
          <h1>Complete your setup</h1>
          <p>Sign in to confirm your core Sprint 4 preferences.</p>
        </div>
        <div className="filterActions">
          <Link href="/account/login">Log in</Link>
          <Link href="/account/register">Create an account</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="recipesPage">
      <div className="pageIntro">
        <h1>Complete your Sprint 4 setup</h1>
        <p>Confirm your language, units, and goal baseline so your account and planner experiences share one source of truth.</p>
      </div>

      <OnboardingPreferencesFlow />
    </div>
  );
}
