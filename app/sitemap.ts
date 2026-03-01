import {type MetadataRoute} from 'next';
import {locales} from '../i18n';

function baseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}

const paths = ['', '/recipes', '/articles', '/favorites', '/shopping-list', '/planner', '/account', '/legal/privacy', '/legal/terms', '/legal/cookies', '/legal/disclaimer'];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const items: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    for (const p of paths) {
      items.push({
        url: `${baseUrl()}/${locale}${p}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: p === '' ? 1 : 0.6
      });
    }
  }
  return items;
}
