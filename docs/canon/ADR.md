# ADR Log

## ADR-0001 — Hosting: Netlify-only (Vercel forbidden)
- Status: Accepted
- Date: 2026-03-02

### Context
The platform must be deployed on a single hosting provider to simplify operations and align with project constraints. The project explicitly forbids using Vercel.

### Decision
We will use **Netlify-only** hosting for:
- Web app hosting (Next.js runtime where supported by Netlify)
- Server-side endpoints via **Netlify Functions**
- Preview deploys for PRS

**Vercel is explicitly forbidden** and must not be referenced in docs, configs, or deployment instructions.

### Consequences
- All deployment documentation and CI/CD assumptions target Netlify.
- Server-side enforcement for Premium gating must run via Netlify runtime/functions.
- Any framework features unsupported by Netlify must have fallbacks or be avoided.
