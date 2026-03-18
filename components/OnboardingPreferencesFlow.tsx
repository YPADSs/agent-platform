'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { withLocale } from '@/lib/locale-path';

const LOCALE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Francais' },
  { value: 'de', label: 'Deutsch' },
  { value: 'es', label: 'Espanol' },
  { value: 'it', label: 'Italiano' },
] as const;

const UNIT_OPTIONS = [
  { value: 'metric', label: 'Metric' },
  { value: 'imperial', label: 'Imperial' },
] as const;

type Preferences = {
  goalCode: string | null;
  locale: string;
  unitSystem: string;
  onboardingStatus: string;
  onboardingCompletedAt: string | null;
};

type Entitlements = {
  isPremium: boolean;
  canUsePlanner: boolean;
  canUsePlannerShoppingAggregation: boolean;
};

const DEFAULT_PREFERENCES: Preferences = {
  goalCode: null,
  locale: 'en',
  unitSystem: 'metric',
  onboardingStatus: 'not_started',
  onboardingCompletedAt: null,
};

const DEFAULT_ENTITLEMENTS: Entitlements = {
  isPremium: false,
  canUsePlanner: false,
  canUsePlannerShoppingAggregation: false,
};

export default function OnboardingPreferencesFlow() {
  const params = useParams<{ locale?: string }>();
  const visitingLocale = typeof params?.locale === 'string' ? params.locale : undefined;
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [entitlements, setEntitlements] = useState<Entitlements>(DEFAULT_ENTITLEMENTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function load() {
      setError(null);
      setStatusMessage(null);
      setLoading(true);

      try {
        const [preferencesResponse, entitlementsResponse] = await Promise.all([
          fetch('/api/v1/me/preferences', { cache: 'no-store' }),
          fetch('/api/v1/me/entitlements', { cache: 'no-store' }),
        ]);

        const preferencesData = await preferencesResponse.json().catch(() => ({}));
        const entitlementsData = await entitlementsResponse.json().catch(() => ({}));

        if (!preferencesResponse.ok || !entitlementsResponse.ok) {
          if (isActive) {
            setError('Unable to load your onboarding setup right now.');
          }
          return;
        }

        if (isActive) {
          setPreferences(preferencesData.preferences ?? DEFAULT_PREFERENCES);
          setEntitlements(entitlementsData.entitlements ?? DEFAULT_ENTITLEMENTS);
        }
      } catch {
        if (isActive) {
          setError('Network error. Please try again.');
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      isActive = false;
    };
  }, []);

  const plannerStatusText = useMemo(() => {
    if (entitlements.canUsePlanner) {
      return 'Planner is available once your core setup is confirmed.';
    }

    return 'Planner stays Premium-gated, but your language and unit choices will still carry across the product.';
  }, [entitlements.canUsePlanner]);

  async function savePreferences(onboardingStatus: 'in_progress' | 'completed') {
    setError(null);
    setStatusMessage(null);
    setSaving(true);

    try {
      const response = await fetch('/api/v1/me/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalCode: preferences.goalCode,
          locale: preferences.locale,
          unitSystem: preferences.unitSystem,
          onboardingStatus,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error ?? 'Update failed.');
        return;
      }

      setPreferences(data.preferences ?? preferences);
      setStatusMessage(
        onboardingStatus === 'completed'
          ? 'Your core setup is complete.'
          : 'Progress saved.',
      );
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await savePreferences('completed');
  }

  if (loading) {
    return (
      <section className="panel">
        <p>Loading onboarding...</p>
      </section>
    );
  }

  return (
    <div className="recipeColumns">
      <section className="panel">
        <h2>Core setup</h2>
        <p>
          Set a planning goal, choose language and units, and create the baseline that the
          rest of Nourivo will use.
        </p>
        <p className="muted">{plannerStatusText}</p>
      </section>

      <section className="panel">
        <form className="preferencesForm" onSubmit={handleSubmit}>
          <label className="field fieldWide">
            <span>Goal</span>
            <input
              value={preferences.goalCode ?? ''}
              onChange={(event) =>
                setPreferences((prev) => ({
                  ...prev,
                  goalCode: event.target.value.trim() || null,
                }))
              }
              placeholder="balanced_eating"
            />
          </label>

          <label className="field">
            <span>Language</span>
            <select
              value={preferences.locale}
              onChange={(event) =>
                setPreferences((prev) => ({
                  ...prev,
                  locale: event.target.value,
                }))
              }
            >
              {LOCALE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Units</span>
            <select
              value={preferences.unitSystem}
              onChange={(event) =>
                setPreferences((prev) => ({
                  ...prev,
                  unitSystem: event.target.value,
                }))
              }
            >
              {UNIT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="filterActions fieldWide">
            <button type="button" disabled={saving} onClick={() => void savePreferences('in_progress')}>
              {saving ? 'Saving...' : 'Save progress'}
            </button>
            <button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Complete setup'}
            </button>
          </div>
        </form>

        {statusMessage ? <p className="statusMessage">{statusMessage}</p> : null}
        {error ? <p className="statusError">{error}</p> : null}
      </section>

      <section className="panel">
        <h2>What happens next</h2>
        <ul className="ingredientList">
          <li>Planner and shopping flows reuse your preferred unit system.</li>
          <li>Language selection stays attached to your account profile.</li>
          <li>Your account page becomes the place to manage Premium and preferences.</li>
        </ul>
        <div className="filterActions">
          <Link href={withLocale(visitingLocale, '/account')} className="buttonSecondary">
            Go to account
          </Link>
          <Link href={withLocale(visitingLocale, '/planner')} className="buttonGhost">
            Review planner
          </Link>
        </div>
      </section>
    </div>
  );
}
