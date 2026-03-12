# ADR-S3-ACCESS-CONTROL — Server-side access control and premium gating

- Status: Accepted
- Date: 2026-03-06

Related issue: #76

## Context

The platform has four product-level roles that must be respected across routes, data, and actions:

- Guest
- User
- Premium
- Admin

The canon PRD and TZ require **server-side premium gating**. UI guards, disabled buttons, and paywall components are not sufficient protection.

Prices, paywalls, and account state are derived from authentication + billing state. Therefore, the account and billing model must map clearly into access control.

## Decision

We will enforce access with the rules below:

1. Authentication is separate from entitlement.
- Guest = unauthenticated
- User = authenticated but no premium entitlement
- Premium = authenticated and active premium entitlement
- Admin = authenticated with admin/editor capabilities; premium entitlement is still evaluated separately for consumer product gating

2. Premium must be determined server-side.
- the server must not trust the client to assert premium access
- premium entitlement must be derived from billing state
- webhooks update billing state in a retry-safe, idempotent way

3. Access control must be checked at the server boundary.
- protected pages, mutations, and data-bearing resolvers must check session + entitlement
- client-side guards are A11y/UX helpers, not security barriers

4 . Denial must be explicit.
- return 401 when authentication is required but missing
- return 403 when the user is authenticated but lacks required access
- use a deterministic error code for subscription-required scenarios

## Protected categories

### Auth-only actions
- manage favorites
- manage shopping list
- view/manage own account
- start checkout
- open customer portal

### Premium-only actions and routes
- access to `/planner`
- actions for premium features defined in canon (VA filters, export/share, etc. as they land)
- server must deny non-premium direct requests even if UI shows an entry point
- admin/editor role does not bypass consumer premium gating on these routes

### Admin/Editor-only actions
- content operations
- translation/publishing workflows
- not in scope for Sprint 3 implementation, but must remain modeled in access control

## Consequences

- All Sprint 3 API and page implementations must call through shared auth/entitlement checks.
- Billing and webhook code must be source-of-truth for premium state, not the UI.
- Testing must include access-control regression and direct-request bypass attempts.
- Paywall is a product UX entry point, not the protection mechanism.
