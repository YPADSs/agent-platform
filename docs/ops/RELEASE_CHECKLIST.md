# Release checklist (pre-launch)

This project is **Netlify-only**. **Vercel is forbidden**.

## Required checks (branch protection)
- [ ] **CI / build** is green (required)
  - Note: GitHub UI may display it as `CI / build (pull_request)`depending on context; when configuring rulesets/branch protection, select **CI / build**.
 - [ ] **Netlify Deploy Preview** is green (recommended)
  - Select the Netlify check that corresponds to Deploy Preview (typically `netlify/<site-name>/deploy-preview`).

## No secrets in repo
- [ ] No `.zv` committed (only `.env.example` or docs)
- [ ] All credentials stored in Netlify site settings only

## Smoke (MVP)
- [ ] `/en/` loads
- [ ] `/en/recipes` loads and search works
- [ ] `/en/articles` loads and search works
- [ ] Detail pages render without errors
- [ ] Auth: register/login works
- [ ] Billing endpoints reachable (dev) / Stripe configured (prod)
- [ ] Premium gating: `/en/planner` blocked for non-premium

## SEO
- [ ] `/robots.txt` returns 200 and references `/sitemap.xml`
- [ ] `/sitemap.xml` returns 200
- [ ] Recipe/Article pages include JSON-LD (schema.org)

## Security baseline
- [ ] Passwords hashed (bcrypt)
- [ ] Stripe webhook verifies signature and is idempotent
- [ ] CSRF strategy documented and applied to state-changing endpoints
- [ ] XSS protections: escape output, avoid dangerouslySetInnerHTML except JSON-LD scripts

## Accessibility (quick pass)
- [ ] Forms have labels
- [ ] Keyboard navigation works for primary flows
- [ ] Focus visible

## Analytics
- [ ] Key events fire in dev (console/log sink)
