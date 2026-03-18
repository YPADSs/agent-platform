import type { Metadata } from 'next';
import { defaultLocale, locales, type Locale } from '@/i18n';

export function getSiteBaseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://nourivo.netlify.app';
}

export function getAbsoluteUrl(path: string) {
  return `${getSiteBaseUrl()}${path}`;
}

export function getLocaleAlternates(path: string) {
  const languages: Record<string, string> = {};

  for (const locale of locales) {
    languages[locale] = getAbsoluteUrl(`/${locale}${path}`);
  }

  languages['x-default'] = getAbsoluteUrl(`/${defaultLocale}${path}`);
  return languages;
}

export function getPublicLocalizedPaths() {
  return ['', '/recipes', '/articles', '/legal/privacy', '/legal/terms', '/legal/cookies', '/legal/disclaimer'];
}

export function getPrivateNoIndexMetadata(title: string): Metadata {
  return {
    title,
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  };
}

export function getLocaleRootMetadata(locale: Locale): Metadata {
  return {
    alternates: {
      languages: getLocaleAlternates(''),
    },
    openGraph: { locale },
  };
}

export function getContentDetailAlternates(
  section: 'recipes' | 'articles',
  slug: string,
) {
  return getLocaleAlternates(`/${section}/${slug}`);
}

export function getContentDetailCanonical(
  section: 'recipes' | 'articles',
  slug: string,
  locale?: Locale,
) {
  const path = locale
    ? `/${locale}/${section}/${slug}`
    : `/${section}/${slug}`;

  return getAbsoluteUrl(path);
}
