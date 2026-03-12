import type { MetadataRoute } from 'next';
import { getSiteBaseUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/account',
          '/favorites',
          '/shopping-list',
          '/planner',
          '/en/account',
          '/fr/account',
          '/de/account',
          '/es/account',
          '/it/account',
          '/en/favorites',
          '/fr/favorites',
          '/de/favorites',
          '/es/favorites',
          '/it/favorites',
          '/en/shopping-list',
          '/fr/shopping-list',
          '/de/shopping-list',
          '/es/shopping-list',
          '/it/shopping-list',
          '/en/planner',
          '/fr/planner',
          '/de/planner',
          '/es/planner',
          '/it/planner',
        ],
      },
    ],
    sitemap: `${getSiteBaseUrl()}/sitemap.xml`,
  };
}
