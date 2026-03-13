import type { Metadata } from 'next';
import { defaultLocale, locales, type Locale } from '@/i18n';

export function getSiteBaseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}

export function getLocaleAlternates(path: string) {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] = `${getSiteBaseUrl()}/${locale}${path}`;
  }
  languages['x-xdefault'] = `${getSiteBaseUrl()}/${defaultLocale}${path}`;
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
    openGraph: {locale},
  };
}
