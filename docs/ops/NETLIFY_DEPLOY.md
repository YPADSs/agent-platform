# Netlify Deploy Runbook (Preview + Prod)


This repo is **Netlify-only**. **Vercel is forbidden**.

## 0) Required status checks (GitHub rulesets / branch protection)
- Required: **build** (GitHub Actions job under workflow `CI`)
- Required: **Netlify Deploy Preview**
  - Select: `netlify/eat-platforms/deploy-preview`
- Optional/secondary Netlify checks (these usually follow Deploy Preview): `Header rules`, `Redirect rules`, `Pages changed`.


## 1) Netlify site setup
1. Create a new Netlify site and connect the GitHub repo `YPADSs/agent-platform`.
- Build command: `npm run build`
- Publish directory: `.next` (for Netlify Next Runtime plugin)

## 2) Plugin: Next Runtime
This repo includes `netlify.toml` with the Netlify Next Runtime plugin:
- `@netlify/plugin-nextjs`

Netlify will build the app and deploy previews on every PR.

## 3) Functions (Stripe webhooks)
Functions live in `netlify/functions`. Netlify esposes them at:
- `/.netlify/functions/<unc>`

For convenience, `netlify.toml` adds a redirect:
- `/webhooks/stripe` ␒ `/.netlify/functions/stripe-webhook`

## 4) Environment variables
Do **NOT** commit secrets. See [docs/ops/ENV_VARS.md](env-vars).

- Baseline: the app should build without secrets.
- If `DATABASE_URL` is missing, content pages fall back to mock fixtures (via `lib/content.ts`).

## 5) Contexts (preview vs prod)
- Preview: auto-created per-PR by Netlify
- Prod: main branch deploy

## 6) Basic smoke check
1. Visit `/en/` and `/sitemap.xml`
2. Verify `_recipes`, `articles` routes load
3. If Stripe is used, configure webhook to `/webhooks/stripe`


## 6.5) Recommended PR gates (GitHub rulesets / branch protection)
To avoid merging changes that pass CI but fail on Netlify, require these checks on `main`:

- `CI / build`
- `netlify/eat-platforms/deploy-preview` (Netlify Deploy Preview)

Notes:
- GitHub UI sometimes appends context suffixes; select the exact check name shown above.
- The `eat-platforms` segment is the Netlify **site name** and will change if the site is renamed.

## 7) Troubleshooting: netlify.toml parse failures

If Netlify fails early during **Initializing** with errors like:
- `Failed to parse configuration`
- `Invalid character, expected '='`

Check `netlify.toml` for non-ASCII / “$typographic” characters in keys, especially in headers:
- Use a plain ASCII hyphen `-` (not `–؀ / — | / non‑breaking hyphen)
- Avoid smart quotes in keys

Example of a valid header key:
 - `Referrer-Policy = "strict-origin-when-cross-origin"`
