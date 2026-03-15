'use client';

import Link from 'next/link';
import { useEffect, useMemo, useParams, useState, type FormEvent } from 'react';
import { withLocale } from '@/lib/locale-path';

const LOCALE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'es', label: 'Español' },
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
  const visitingLocale = typeof params?.locale === "string" ? params.locale : undefined;
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
      return 'Planner is ready on this account once your core setup is confirmed.';
    }

    return 'Planner remains Premium-gated, but units and language will carry forward to your account experience.';
  }, [entitlements.canUsePlanner]);

  const isCompleted = preferences.onboardingStatus === 'completed';
  const activeLocale = visitingLocale ?? preferences.locale;

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
          ? 'Your Sprint 4 core setup is completed.'
          : 'Onboarding progress saved.',
      );
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void savePreferences('completed');
  }

  if (loading) {
    return (
      <section className="panel">
        <p>Loading Sprint 4 onboarding ...</p>
      </section>
    );
  }

  return (
    <div className="recipeColumns">
      <section className="panel">
        <h2>Complete your core setup</h2>
        <p>Confirm your goal, language, and units so Sprint 4 experiences can pull from a single source of truth.</p>
        <p className="muted">{plannerStatusText}</p>
        <div className="emptyState">
          <p>
            Sprint 4 V1 currently persists <strong>goal</strong>, <strong>language</strong>, and
            <strong>units</strong> as the core onboarding baseline.
          </p>
          <p className="muted">
            Diet/preference/allergy details can be extended later only when explicitly scoped.
          </p>
        </div>
      </section>

      <section className="panel">
        <form className="preferencesForm" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="goalCode">Goal</label>
            <input
              id="goalCode"
              name="goalCode"
              type="text"
              value={preferences.goalCode ?? ''}
              onChange={(event) =>
                setPreferences((prev) => ({
                  ...prev,
                  goalCode: event.target.value.trim() || null,
                }))
              }
              placeholder="balanced_eating"
            />
            <p className="muted">Use a simple internal code like `balanced_eating` or `strength_focus`.</p>
          </div>

          <div className="field">
            <label htmlFor="locale">Language</label>
            <select
              id="locale"
              name="locale"
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
          </div>

          <div className="field">
            <label htmlFor="unitSystem">Units</label>
            <select
              id="unitSystem"
              name="unitSystem"
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
          </div>

          <div className="filterActions">
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                void savePreferences('in_progress');
              }}
            >
              {saving ? 'Saving ...' : 'Save progress'}
            </button>
            <button type="submit" disabled={saving}>
              {saving ? 'Saving ...' : 'Complete setup'}
            </button>
          </div>

          {preferences.onboardingCompletedAt ? (
            <p className="muted">
              Completed on {new Date(preferences.onboardingCompletedAt).toLocaleDateString()}
            </p>
          ) : null}
        </form>

        {statusMessage ? <p className="statusMessage">{statusMessage}</p> : null}
        {error ? <p className="statusError">{error}</p> : null}
      </section>

      <section className="panel">
        <h2>Next steps</h2>
        <ul className="ingredientList">
          <li>
            <strong>Account</strong>
            <span className="muted">Manage the same preferences from your account page.</span>
          </li>
          <li>
            <strong>Planner</strong>
            <span className="muted">Premium-gated access stays server-side, but these units will carry forward.</span>
          </li>
          <li>
            <strong>Shopping list</strong>
            <span className="muted">Aggregated items can now readyour unit preference on the server.</span>
          </li>
        </ul>
        <div className="filterActions">
          <Link href={withLocale(activeLocale, '/account')}>Go to Account</Link>
          <Link href={withLocale(activeLocale, '/planner')}>{isCompleted ? 'Go to Planner' : 'View Planner status'}</Link>
        </div>
      </section>
    </div>
  );
}
