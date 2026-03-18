'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';

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

const ONBOARDING_OPTIONS = [
  { value: 'not_started', label: 'Not started' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'skipped', label: 'Skipped' },
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

export default function AccountPreferencesPanel() {
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [entitlements, setEntitlements] = useState<Entitlements>(DEFAULT_ENTITLEMENTS);
  const [liveStatus, setLiveStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function load() {
      setError(null);
      setLiveStatus(null);
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
            setError('Unable to load your account preferences right now.');
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
      return 'Planner access is active for this account.';
    }

    return 'Planner remains Premium-gated until you upgrade.';
  }, [entitlements.canUsePlanner]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLiveStatus(null);
    setSaving(true);

    try {
      const response = await fetch('/api/v1/me/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalCode: preferences.goalCode,
          locale: preferences.locale,
          unitSystem: preferences.unitSystem,
          onboardingStatus: preferences.onboardingStatus,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error ?? 'Update failed.');
        return;
      }

      setPreferences(data.preferences ?? preferences);
      setLiveStatus('Preferences saved.');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="panel">
        <p>Loading account preferences...</p>
      </section>
    );
  }

  return (
    <section className="panel">
      <h2>Preferences</h2>
      <p>Keep language, units, and onboarding state aligned across the product.</p>
      <p className="muted">{plannerStatusText}</p>

      <form className="preferencesForm" onSubmit={handleSubmit}>
        <label className="field fieldWide">
          <span>Goal code</span>
          <input
            value={preferences.goalCode ?? ''}
            onChange={(event) =>
              setPreferences((prev) => ({
                ...prev,
                goalCode: event.target.value || null,
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

        <label className="field fieldWide">
          <span>Onboarding status</span>
          <select
            value={preferences.onboardingStatus}
            onChange={(event) =>
              setPreferences((prev) => ({
                ...prev,
                onboardingStatus: event.target.value,
              }))
            }
          >
            {ONBOARDING_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="preferencesActions fieldWide">
          <button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save preferences'}
          </button>
          {preferences.onboardingCompletedAt ? (
            <p className="muted">
              Completed on {new Date(preferences.onboardingCompletedAt).toLocaleDateString()}
            </p>
          ) : null}
        </div>
      </form>

      {liveStatus ? <p className="statusMessage">{liveStatus}</p> : null}
      {error ? <p className="statusError">{error}</p> : null}
    </section>
  );
}
