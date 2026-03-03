# CI + Quality Gates (Sprint 1–2)

This repo uses GitHub Actions CI to run:
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`

## Workflow name stability
- Workflow: `CI`
- Job: `build`
- Required status check name: `CI / build`
  - Note: GitHub UI may show `CI / build (pull_request)`; select `CI / build` in rulesets/branch protection.

## Enabling required status checks (manual)
1. Repo ₒ **Settings** → **Rules** → **Rulesets** (or Branch protection rules).
2. Create/enable a ruleset for `main`.
2. Require status checks:
   - `CI / build`
3. (Optional) Require PRS, squash merge, and linear history.

> Note: No secrets are required for CI runs. Store sensitive values in GitHub Secrets and only reference env variable names in repo.

## Netlify deploy checks (recommended in Sprint 2)
In addition to `CI / build`, we recommend requiring the Netlify Deploy Preview check for PRs.

- Required Netlify check (stable): `netlify/eat-platforms/deploy-preview`
  - Note: the `eat-platforms` segment comes from the Netlify **site name**. If you rename the site, the check name will change.
 - Other Netlify checks like `Header rules`, `Redirect rules`, `Pages changed` are useful signals, but `deploy-preview` is the primary gate.
