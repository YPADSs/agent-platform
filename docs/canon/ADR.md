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

---

## ADR-0002 — Stack lock for Sprint 1 (Netlify + Next.js + DB + Prisma + Auth)
- Status: Accepted
- Date: 2026-03-02

### Context
Sprint 1 requires an implementable end-to-end stack under the Netlify-only constraint. We need clear decisions for runtime, data storage, ORM/migrations, and authentication to unblock S1 implementation.

### Decision
For Sprint 1 we will use:
- **Hosting/Runtime**: Netlify (Next.js runtime where supported) + Netlify Functions for server-side endpoints (including Stripe webhooks).
- **Database provider**: PostgreSQL managed by **Neon** (hosted PostgreSQL) for production, with PostgreSQL compatible local development (ex. Docker) as a tooling choice.
- **ORM/Migrations**: Prisma for data access and migrations.
- **Auth**: NextAuth.js with a Prisma adapter for session persistence. The app will enforce roles *Guest/User/Premium/Admin** server-side. Premium is an **entitlement** derived from Stripe subscription state, not a static role assignment.

### Consequences
- Deployment config will include `netlify.toml` and documented env var names (no secrets committed).
m Prisma schema must support roles and subscriptions and an idempotency ledger for Stripe webhooks.
- Server-side gating must not rely on UI only for Premium features.

---

## Pending AD2s (not decided yet)
> These are tracked here for visibility; they do **not** change scope without explicit approval.

- Observability strategy (logs/alerts) and webhook dead-letter handling.
