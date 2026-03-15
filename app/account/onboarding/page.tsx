import Link from 'next/link';
import OnboardingPreferencesFlow from '@/components/OnboardingPreferencesFlow';
import { withLocale } from '@/lib/locale-path';
import { requireSession } from '@/lib/session';

type AccountOnboardingPageProps = {
  params?: { locale?: string };
};

export default async function AccountOnboardingPage({ params }: AccountOnboardingPageProps) {
  const locale = params?.locale;

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
          <Link href={withLocale(locale, '/account/login')}>Log in</Link>
          <Link href={withLocale(locale, '/account/register')}>Create an account</Link>
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
