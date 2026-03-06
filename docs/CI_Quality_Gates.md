# CI + Quality Gates (Sprint 1)

This repo uses GitHub Actions CI to run:
- `node scripts/validate-netlify-config.mjs` (guards against Netlify deploy failures)
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`

## Workflow name stability
- Workflow: `CI`
- Job: `build`
- Required status check name (rulesets/branch protection): `build`
  - Note: GitHub may display it as `CI / build` (and sometimes append `(pull_request)`i), but in rulesets you must select the exact check name from the "Add checks" dropdown (currently `build`).

## Enabling required status checks (manual)
1. Repo → **Settings** → **Rules** → **Rulesets** (or Branch protection rules).
2. Create/enable a ruleset for `main`.
3. Require status checks:
   - `build`
4. (Optional) Require PRs, squash merge, and linear history.

> Note: No secrets are required for CI runs. Store sensitive values in GitHub Secrets and only reference env variable names in repo.
