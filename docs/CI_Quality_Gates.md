# CI + Quality Gates (Sprint 1)

This repo uses GitHub Actions CI to run:
- `npm run lint`
- `npm run typecheck`
- `npm run build`

## Enabling required status checks (manual)
If branch rules/rulesets are currently not enforced, enable them in GitHub UI:

1. Repo → **Settings** → **Rules** → **Rulesets** (or Branch protection rules).
2. Create/enable a ruleset for `main`.
3. Require status checks:
   - `CI / build`
4. (Optional) Require PRs, squash merge, and linear history.

> Note: ruleset updates are not automated here; no secrets are required for enabling checks.
