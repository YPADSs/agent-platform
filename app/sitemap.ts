import { type MetadataRoute } from 'next';
import { getLocalizedPublicPaths, getSiteBaseUrl } from '@/lib/seo';
import { locales } from '../i18n';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const items: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const path of getLocalizedPublicPaths()) {
      items.push({
        url: `${getSiteBaseUrl()}/${locale}${path}`,
        lastModified: now,
        changeFrequency: path === '' ? 'daily' : 'weekly',
        priority: path === '' ? 1 : 0.7,
      });
    }
  }

  return items;
}
