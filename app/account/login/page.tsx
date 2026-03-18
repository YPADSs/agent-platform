'use client';

import { signIn } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { withLocale } from '@/lib/locale-path';

export default function LoginPage() {
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

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (!result || result.error) {
      setError('Incorrect email or password.');
      return;
    }

    router.push(withLocale(locale, '/account'));
    router.refresh();
  }

  return (
    <div className="recipesPage">
      <div className="pageIntro">
        <p className="eyebrow">Authentication</p>
        <h1>Log in to Nourivo.</h1>
        <p>Return to your planner, shopping list, pantry, and subscription settings.</p>
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
              required
            />
          </label>
          <div className="filterActions fieldWide">
            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </div>
        </form>

        {error ? <p className="statusError">{error}</p> : null}
        <p className="muted">
          Need an account?{' '}
          <a href={withLocale(locale, '/account/register')} className="cardLink">
            Create one here
          </a>
          .
        </p>
      </section>
    </div>
  );
}
