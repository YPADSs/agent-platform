# i18n + SEO — v1

date: 2026-03-02

Scope: SEO requirements per ТЗ: schema.org, sitemap.xml, hreflang, OpenGraph, Core Web Vitals. Supports locales EN/FR/DE/ES/IT.

---

## 1) URL & locale assumptions
- Locale support: `en`, `fr`, `de`, `es`, `it`.
- Locale routing strategy (path prefix vs domain) is an implementation choice; SEO rules below apply either way.

---

## 2) hreflang (MUST)
- Provide `hreflang` links for each available locale variant of the same page (recipes/articles).
- Include `x-default` pointing to EN.
- Only include hreflang entries for locales that truly exist (do not point to fallback pages as “real translations”).

---

## 3) Canonical rules (MUST)
- If a localized translation exists: page canonicalizes to **itself** (same locale URL).
- If a locale view is a **fallback to EN** (translation missing):
  - Prefer **not** to expose that as a separate indexable locale page.
  - If it is exposed, ensure:
    - canonical points to the EN page, and
    - hreflang does **not** claim the missing locale as translated.

> This is to prevent duplicate content indexing when fallback is used.

---

## 4) Sitemaps (MUST)
- Provide `sitemap.xml` (or sitemap index) including:
  - Home (`/`)
  - Recipes catalog + recipe details
  - Articles catalog + article details
  - Legal pages (`/legal/*`)
- Locale handling:
  - Include URLs per locale **only if** the page is actually translated/published for that locale.
  - Option: sitemap index with per-locale sitemaps (allowed; implementation choice).

---

## 5) Structured data (MUST)
- Recipes: schema.org `Recipe`
  - include: name, description, image, recipeIngredient, recipeInstructions, nutrition (calories/protein/fat/carbs) where available
- Articles: schema.org `Article`
  - include: headline, image, datePublished/dateModified, author/publisher if available

---

## 6) OpenGraph / Social metadata (MUST)
- Per page: `og:title`, `og:description`, `og:image`, `og:url`
- Twitter card tags (summary_large_image recommended)

---

## 7) Core Web Vitals (MUST)
- Optimize images (responsive, lazy-load where appropriate)
- Avoid layout shift (reserve space for images)
- Use SSR where needed for indexable content
- Cache and compress static assets

---

## 8) Robots & legal pages
- Legal pages must exist: Privacy/Terms/Cookies/Disclaimer.
- Indexing policy can be: index legal pages (usually OK) but avoid thin duplicates.

