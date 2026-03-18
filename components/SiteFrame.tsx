'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';

type SiteFrameProps = {
  children: React.ReactNode;
};

const locales = ['en', 'fr', 'de', 'es', 'it'] as const;

const localeCopy = {
  en: {
    tagline: 'Healthy eating, made operational.',
    footer: 'Plan better meals, save smarter groceries, and keep your pantry in sync.',
  },
  fr: {
    tagline: 'Manger sain, en version pratique.',
    footer: 'Planifiez vos repas, organisez vos courses et gardez votre pantry synchronisee.',
  },
  de: {
    tagline: 'Gesundes Essen, alltagstauglich gemacht.',
    footer: 'Plane Mahlzeiten, organisiere Einkaufe und halte deine Vorrate synchron.',
  },
  es: {
    tagline: 'Comer sano, convertido en rutina.',
    footer: 'Planifica mejor, compra con criterio y manten tu despensa sincronizada.',
  },
  it: {
    tagline: 'Mangiare bene, in modo concreto.',
    footer: 'Pianifica i pasti, coordina la spesa e tieni la dispensa aggiornata.',
  },
} as const;

function isLocale(value: string | undefined): value is (typeof locales)[number] {
  return Boolean(value && locales.includes(value as (typeof locales)[number]));
}

function localizeHref(locale: string | undefined, href: string) {
  if (!locale) {
    return href;
  }

  return href === '/' ? `/${locale}` : `/${locale}${href}`;
}

function isActive(pathname: string, href: string, locale?: string) {
  const localizedHref = localizeHref(locale, href);
  if (localizedHref === pathname) {
    return true;
  }

  if (href !== '/' && pathname.startsWith(`${localizedHref}/`)) {
    return true;
  }

  return false;
}

export default function SiteFrame({ children }: SiteFrameProps) {
  const params = useParams<{ locale?: string }>();
  const pathname = usePathname();
  const localeParam = typeof params?.locale === 'string' ? params.locale : undefined;
  const locale = isLocale(localeParam)
    ? localeParam
    : undefined;
  const copy = locale ? localeCopy[locale] : localeCopy.en;
  const pathWithoutLocale = pathname.replace(/^\/(en|fr|de|es|it)(?=\/|$)/, '') || '/';

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/recipes', label: 'Recipes' },
    { href: '/articles', label: 'Articles' },
    { href: '/favorites', label: 'Favorites' },
    { href: '/shopping-list', label: 'Shopping list' },
    { href: '/planner', label: 'Planner' },
    { href: '/pantry', label: 'Pantry' },
    { href: '/account', label: 'Account' },
  ];

  return (
    <div className="siteShell">
      <header className="siteHeader">
        <div className="siteHeaderInner">
          <Link href={localizeHref(locale, '/')} className="siteBrand">
            <span className="siteBrandMark">N</span>
            <span>
              <strong>Nourivo</strong>
              <small>{copy.tagline}</small>
            </span>
          </Link>

          <nav className="siteNav" aria-label="Primary">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={localizeHref(locale, item.href)}
                className={isActive(pathname, item.href, locale) ? 'siteNavLink active' : 'siteNavLink'}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="localeSwitcher" aria-label="Locales">
            {locales.map((loc) => (
              <Link
                key={loc}
                href={localizeHref(loc, pathWithoutLocale)}
                className={locale === loc ? 'localePill active' : 'localePill'}
              >
                {loc.toUpperCase()}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <main className="siteMain">{children}</main>

      <footer className="siteFooter">
        <div className="siteFooterInner">
          <div>
            <h2>Nourivo</h2>
            <p>{copy.footer}</p>
          </div>
          <nav className="siteFooterNav" aria-label="Legal">
            <Link href={localizeHref(locale, '/legal/privacy')}>Privacy</Link>
            <Link href={localizeHref(locale, '/legal/terms')}>Terms</Link>
            <Link href={localizeHref(locale, '/legal/cookies')}>Cookies</Link>
            <Link href={localizeHref(locale, '/legal/disclaimer')}>Disclaimer</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
