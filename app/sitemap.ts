import type { MetadataRoute } from 'next';
import { locales } from '../i18n';

const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const paths = ['/', '/recipes', '/articles', '/favorites', '/shopping-list', '/account'];

export default function sitemap(): MetadataRoute.Sitemap {
  // Locale is cookie-based (no prefix). We still emit alternates in sitemap via query param.
  return paths.map((p) => {
    const url = `${base}${p}`;
    const alternates: Record<string, string> = {};
    for (const l of locales) {
      alternates[l] = `${url}?lang=${l}`;
    }
    return {
      url,
      lastModified: new Date(),
      alternates: { languages: alternates },
    };
  });
}
