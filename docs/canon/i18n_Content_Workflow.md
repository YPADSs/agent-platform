# i18n Content Workflow — v1

date: 2026-03-02

Requirement (ТЗ): platform is multi-language for western audience: **EN/FR/DE/ES/IT**.

---

## 1) Supported locales
- `en`, `fr`, `de`, `es`, `it`

MVP note:
- MVP ships with **EN content** at minimum, while the architecture/workflow supports all locales.

---

## 2) Roles & responsibilities
- **Admin/Editor**: creates/edits content and translations; manages publishing.
- **User/Premium/Guest**: consumes localized UI/content (no editing rights).

---

## 3) Content lifecycle (draft → review → published)
Applies to: recipes, articles, ingredient dictionary entries, tags/categories translations.

States:
1. **Draft**: created or edited, not visible publicly.
2. **Review**: editorial review (content quality, sources, formatting).
3. **Published**: visible publicly and indexable per SEO rules.

Publishing rules:
- EN translation is required to publish any content item.
- Other locales can be published later; missing locales follow fallback rules.

---

## 4) Translation completeness model
For each entity (recipe/article/ingredient/tag/category):
- Track per-locale status: missing | draft | review | published.
- Track a simple completion indicator (e.g. % locales published) for admin UI.

---

## 5) Fallback policy (must be consistent with SEO)
- If a requested locale translation is missing, fallback to **EN**.
- UI should optionally indicate that content is shown in EN due to missing translation.
- SEO must avoid duplicate-content issues; canonical/hreflang strategy is documented in `i18n_SEO.md`.

---

## 6) UI strings vs Content translations
- UI strings: localized resource files per locale (format TBD by implementation).
- Content: stored as translations per entity (see `DataModel.md` translation tables).

---

## 7) Guardrails
- Do not introduce new locales without explicit requirements change.
- No vendor/tool lock-in is assumed here; translation tooling choice is out-of-scope.
