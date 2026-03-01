import type { Metadata } from 'next';
import Link from 'next/link';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';
import { locales } from '../i18n';
import './globals.css';

export const metadata: Metadata = {
  title: 'Healthy Food Platform',
  description: 'Recipes and articles about healthy nutrition',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();
  const t = await getTranslations('nav');

  const navItems = [
    { href: '/', label: t('home') },
    { href: '/recipes', label: t('recipes') },
    { href: '/articles', label: t('articles') },
    { href: '/favorites', label: t('favorites') },
    { href: '/shopping-list', label: t('shoppingList') },
    { href: '/account', label: t('account') },
  ];

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <header className="header">
            <nav className="nav">
              {navItems.map((i) => (
                <Link key={i.href} href={i.href} className="navLink">
                  {i.label}
                </Link>
               ))}
            </nav>

            <div className="nav">
              {locales.map((l) => (
                <a
                  key={l}
                  className="navLink"
                  href={`/api/set-locale?locale=${l}`}
                  aria-label={`Switch language to ${l}`}
                >
                  {l.toUpperCase()}
                </a>
              ))}
            </div>
          </header>

          <main className="main">{children}</main>

          <footer className="footer">
            <Link href="/legal/privacy">Privacy</Link> · <Link href="/legal/terms">Terms</Link> ·{' '}
            <Link href="/legal/cookies">Cookies</Link> · <Link href="/legal/disclaimer">Disclaimer</Link>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
