import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, locales, type Locale } from '../i18n';

function pickSupportedLocale(input: string | null): Locale {
  if (!input) return defaultLocale;
  const lower = input.toLowerCase();
  // try full match
  for (const loc of locales) {
    if (lower === loc) return loc;
  }
  // try prefix match like en-US
  const prefix = lower.split('-')[0] as Locale;
  return (locales as readonly string[]).includes(prefix) ? prefix : defaultLocale;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const loc = pickSupportedLocale((await requestLocale()) ?? null);

  return {
    locale: loc,
    messages: (await import(`../messages/${loc}.json`)).default,
  };
});
