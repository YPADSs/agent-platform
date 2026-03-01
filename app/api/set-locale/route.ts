import { NextResponse } from 'next/server';
import { locales, defaultLocale } from '../../../i18n';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const locale = url.searchParams.get('locale') || defaultLocale;
  const next = url.searchParams.get('next') || '/';
  const value = (locales as readonly string[]).includes(locale) ? locale : defaultLocale;

  const res = NextResponse.redirect(new URL(next, url.origin));
  res.cookies.set('NEXT_LOCALE', value, { path: '/', sameSite: 'lax' });
  return res;
}
