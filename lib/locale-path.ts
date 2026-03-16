export function withLocale(locale: string | undefined, path: string) {
  return locale ? `/${locale}${path}` : path;
}
