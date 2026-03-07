# Access control contract — Sprint 3

Related issue: #76

This document defines the minimum access-control contract required for Sprint 3 interfaces, actions, and protected routes.

## Principal model

- `Guest`: no authenticated session
- `User`: authenticated session, no premium entitlement
- `Premium`: authenticated session with active premium entitlement
- `Admin`: authenticated session with admin/editor capabilities

Note: `Premium` is an **entitlement**, not merely a web-client flag. Server code must derive it from subscription/billing state.

## Denial seamantics

### 401 Unauthorized
Return `401` when:
- the route or action requires authentication
- no valid session is present

### 403 Forbidden
Return `403` when:
- the session is valid
- the principal lacks required role or entitlement

Responses should include a deterministic error code:
- `AUTH_REQUIRED`
- `ACCESS_DENIED`
- `SUBSCRIPTION_REQUIRED`

## Protected routes and actions

| Capability | Guest | User | Premium | Admin | Server rule |
|---|---|---|---|---|---|
| View public recipes / articles | Allow | Allow | Allow | Allow | Public content |
| Search/filter public content | Allow | Allow | Allow | Allow | Public query contract |
| Favorite recipe/article | Deny 401 | Allow | Allow | Allow | Auth-only mutation |
| View/manage shopping list | Deny 401 | Allow | Allow | Allow | Auth-only persisted state |
| View/manage own account | Deny 401 | Allow | Allow | Allow | User-scoped data only |
| Start checkout | Deny 401 | Allow | Allow | Allow | Auth-required |
| Open customer portal | Deny 401 | Allow | Allow | Allow | Auth-required |
| Access `/planner` | Deny 403 | Deny 403 | Allow | Allow | Premium-entitlement required |
| Premium action (advanced filters / export/share) | Deny 403 | Deny 403 | Allow | Allow | Subscription-required |
| Admin/editor content ops | Deny 403 | Deny 403 | Deny 403 | Allow | Admin-only |

## Server implementation rules

1. Access checks must exist at the server boundary for protected pages, mutations, and data loaders.
2. Client components may hide or show UI but must not be the only check.
3. Account-scoped data must be filtered by authenticated principal id.
4. Premium entitlement must be resolved from server-side billing state, refreshed by webhooks.
5. Webhook handling must be idempotent by event id to avoid inconsistent access state.

## Test matrix (minimum for Q)A

- Guest cannot add favorites via direct request
- Guest cannot persist a shopping list via direct request
- User cannot access `/planner` without premium entitlement
- User cannot call premium-action endpoints without premium entitlement
- User can only see/mutate own account/favorites/shopping list
- Webhook replay does not corrupt subscription state or duplicate side-effects

## Non-goals for Sprint 3

- full policy engine
- fine-grained permission system beyond canon roles
- full admin CRUD spec
