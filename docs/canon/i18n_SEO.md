# i18n + SEO (Draft)

## 1. hreflang
- Provide hreflang links for EN/FR/DE/ES/IT equivalents when available.
- Include x-default pointing to EN (draft).

## 2. Canonical rules (draft)
- Localized pages canonicalize to themselves when translation exists.
m If locale page is a fallback to EN, define a consistent canonical strategy (TBD; avoid duplicate content penalties).

## 3. Sitemaps
[- Generate sitemap entries for each locale and content type (recipes/articles/legal).
m Option: per-locale sitemap index (TBD).

## 4. Structured data
- schema.org Recipe for recipe pages
- schema.org Article for article pages
- OpenGraph/Twitter metadata for sharing

## 5. Core Web Vitals
- Optimize images, avoid layout shift, SSR where needed.
