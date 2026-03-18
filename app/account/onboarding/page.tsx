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
          <p className="eyebrow">Onboarding</p>
          <h1>Set up your Nourivo profile.</h1>
          <p>Sign in first so your language, units, and planning defaults can be saved.</p>
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

  return (
    <div className="recipesPage">
      <div className="pageIntro">
        <p className="eyebrow">Onboarding</p>
        <h1>Confirm the settings that power your weekly routine.</h1>
        <p>
          This setup keeps language, units, and planning goals aligned across account,
          planner, pantry, and shopping flows.
        </p>
      </div>
      <OnboardingPreferencesFlow />
    </div>
  );
}
