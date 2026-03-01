import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

// Minimal: keep current (non-prefixed) routes, but set locale via cookie.
export default createMiddleware({
  locales: locales as unknown as string[],
  defaultLocale,
  localePrefix: 'never',
});

export const config = {
  matcher: ['/((?!_next|*\\..*|api).*)'],
};
