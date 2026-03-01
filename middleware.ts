import createMiddleware from 'next-intl/middleware';
import {defaultLocale, locales} from './i18n';

export default createMiddleware({
  locales: locales as unknown as string[],
  defaultLocale,
  localePrefix: 'always'
});

export const config = {
  matcher: ['/((?!_next|.*\\..*|api).*)']
};
