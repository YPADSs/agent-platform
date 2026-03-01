import Link from 'next/link';
import {notFound} from 'next/navigation';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages, getTranslations, unstable_setRequestLocale} from 'next-intl/server';
import {defaultLocale, locales, type Locale} from '../../i18n';

type Props = {
  children: React.ReactNode;
  params: {locale: string};
};

function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

function baseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}

export async function generateMetadata({params}: Omit<Props, 'children'>) {
  const locale = isLocale(params.locale) ? params.locale : defaultLocale;
  const languages: Record<string, string> = {};
  for (const l of locales) {
    languages[l] = `${baseUrl()}/${l}`;
  }
  return {
    alternates: {
      canonical: `${baseUrl()}/${locale}`,
      languages
    }
  };
}

export default async function LocaleLayout({children, params}: Props) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;

  unstable_setRequestLocale(locale);

  const messages = await getMessages();
  const t = await getTranslations('nav');

  const navItems = [
    {href: `/${locale}/`, label: t('home')},
    {href: `/${locale}/recipes`, label: t('recipes')},
    {href: `/${locale}/articles`, label: t('articles')},
    {href: `/${locale}/favorites`, label: t('favorites')},
    {href: `/${locale}/shopping-list`, label: t('shoppingList')},
    {href: `/${locale}/planner`, label: t('planner')},
    {href: `/${locale}/account`, label: t('account')}
  ];

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <header className="header">
        <nav className="nav">
          {navItems.map(i => (
            <Link key={i.href} href={i.href} className="navLink">
              {i.label}
            </Link>
          ))}
        </nav>
        <div className="nav">
          {locales.map(l => (
            <Link key={l} href={`/${l}${params.locale === l ? '' : ''}`} className="navLink" aria-label={`Switch language to ${l}`}>
              {l.toUpperCase()}
            </Link>
          ))}
        </div>
      </header>
      <main className="main">{children}</main>
      <footer className="footer">
        <Link href={`/${locale}/legal/privacy`}>Privacy</Link> ·{' '}
        <Link href={`/${locale}/legal/terms`}>Terms</Link> ·{' '}
        <Link href={`/${locale}/legal/cookies`}>Cookies</Link> ·{' '}
        <Link href={`/${locale}/legal/disclaimer`}>Disclaimer</Link>
      </footer>
    </NextIntlClientProvider>
  );
}
