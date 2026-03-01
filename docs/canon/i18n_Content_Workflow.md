# i18n Content Workflow (Draft)

## Supported languages
EN, FR, DE, ES, IT

## Content lifecycle (draft)
States: Draft → Review → Published
- Admin/Editor can create/edit content and translations.
- Publishing requires at least EN; other locales can follow with fallback rules.

## Fallback policy (draft)
- If a locale translation is missing, fallback to EN (explicitly marked in UI where needed).

## Translation operations (draft)
- Track translation completeness per entity (recipe/article/ingredient).
- Prevent broken SEO: locale pages without translations should handle canonical/fallback consistently (see i18n_SEO.md).
