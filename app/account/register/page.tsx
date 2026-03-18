'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { withLocale } from '@/lib/locale-path';

export default function RegisterPage() {
  const router = useRouter();
  const params = useParams<{ locale?: string }>();
  const locale = typeof params?.locale === 'string' ? params.locale : undefined;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setError(typeof payload.error === 'string' ? payload.error : 'Unable to create account.');
        return;
      }

      router.push(withLocale(locale, '/account/login'));
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="recipesPage">
      <div className="pageIntro">
        <p className="eyebrow">Authentication</p>
        <h1>Create your Nourivo account.</h1>
        <p>Set up a profile so your recipes, shopping, pantry, and planner can stay connected.</p>
      </div>

      <section className="panel">
        <form onSubmit={handleSubmit} className="preferencesForm">
          <label className="field fieldWide">
            <span>Email</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
          </label>
          <label className="field fieldWide">
            <span>Password</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              minLength={8}
              required
            />
          </label>
          <div className="filterActions fieldWide">
            <button type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>

        {error ? <p className="statusError">{error}</p> : null}
        <p className="muted">
          Already registered?{' '}
          <a href={withLocale(locale, '/account/login')} className="cardLink">
            Log in here
          </a>
          .
        </p>
      </section>
    </div>
  );
}
