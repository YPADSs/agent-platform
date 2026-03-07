# Sprint 3 role and access matrix

Related issue: #75

This document defines the role-aware behavior expected in Sprint 3 and is aligned with the canon PRD.

## Roles

### Guest
Allowed:
- view public recipes and articles
- use basic search/filter on public content
- view home and legal pages

Restricted:
- persisted favorites
- persisted shopping list
- account management
- premium routes/features

UX expectation:
- guest should see honest auth CTA or paywall where applicable
- guest must not receive persisted user state from the server

### User
Allowed:
- register/login/logout
- manage favorites for recipes and articles
- manage base shopping list
- open account and see subscription state
- manage own preferences/settings shell

Restricted:
- planner premium access
- advanced premium filters
- export/share premium actions

### Premium
Allowed:
- everything in User
- access to premium-gated routes and actions defined by server
- planner route access
- premium billing/account management flows

Restricted:
- admin/editor-only content operations

### Admin
Allowed:
- may access admin/editor content workflows as defined elsewhere
- retains access to user/premium-visible areas where appropriate

Note:
Sprint 3 does not require full admin CRUD completion. Admin must still be considered in access design.

## Server-side rules

1. Premium gating must be enforced by the server, not only the UI.
2. Guest cannot bypass auth-only routes by direct request.
3. User cannot bypass premium-only routes by direct request.
4. Account data is scoped to the authenticated principal.
5. Billing state must map to access state in a retry-safe way.

## Route/action summary

| Capability | Guest | User | Premium | Admin |
|---|---|---|---|---|
| View public recipes/articles | Yes | Yes | Yes | Yes |
| Search/filter public content | Yes | Yes | Yes | Yes |
| Favorite recipe/article | No | Yes | Yes | Yes |
| Persist shopping list | No | Yes | Yes | Yes |
| Open account | No | Yes | Yes | Yes |
| Start checkout | No | Yes | Yes | Yes |
| Open customer portal | No | Yes | Yes | Yes |
| Access planner | No | No | Yes | Yes |
| Content ops/admin workflow | No | No | No | Yes |

## Sprint 3 assumptions

- Guest-local temporary state for shopping list is not a requirement and, if introduced later, must be treated as Proposal.
- Planner may exist as a gated placeholder in Sprint 3, but it must not be marketed as fully completed.
- Free-vs-Premium fine-grained limits beyond the canon MVP must not be introduced silently.
