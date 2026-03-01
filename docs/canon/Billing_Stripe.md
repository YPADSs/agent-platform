# Billing (Stripe) — v1

date: 2026-03-02

Scope: Freemium + Premium subscription via Stripe per ТЗ. No secrets/keys are stored in repo.

Hosting: **Netlify-only** — webhook endpoint(s) run via Netlify Functions.

---

## 1) Core flows

### 1.1 Upgrade (Checkout)
1. Authenticated user clicks Upgrade → server creates Stripe Checkout Session.
2. Client redirects to Stripe Checkout.
3. Stripe redirects back to success/cancel URL.
4. Access is granted **only after** server confirms subscription state (via webhook and/or verified lookup).

### 1.2 Manage subscription (Customer Portal)
1. Authenticated user requests a Stripe Customer Portal session from server.
2. Client redirects to portal for cancel/update/payment method.
3. Subscription changes are synced back to our system via webhooks.

---

## 2) Server-side Premium gating (MUST)
Premium features must be enforced on the server:
- Protected pages/endpoints (e.g. `/planner`) must check entitlements server-side.
- UI-only checks are insufficient.

---

## 3) Webhooks (MUST: reliability)

### 3.1 Signature verification
- Verify Stripe signature on every webhook request using Stripe’s signing secret (stored as env var in Netlify, not in repo).

### 3.2 Idempotency (exactly-once logically)
- Treat Stripe delivery as **at-least-once**.
- Use `event.id` as the idempotency key.
- Persist processed event IDs (e.g. `billing_event` ledger). If already processed → return 2xx with no side effects.

### 3.3 Retry safety
- Stripe retries on non-2xx responses; handler must be retry-safe.
- On transient failures: do not partially apply state; retry should converge.

### 3.4 Minimal event coverage (per ТЗ)
Required:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

> Event list can expand later, but MVP must cover subscription state transitions reliably.

---

## 4) Subscription state model (minimum)
Persist at least:
- Stripe customer id
- Stripe subscription id
- status (trialing|active|past_due|canceled|unpaid|incomplete)
- current_period_end
- cancel_at_period_end
- plan key (e.g. premium_monthly)

Entitlements:
- derive `is_premium` from subscription status (typically `active` / `trialing`).
- keep a server-side snapshot/cache updated via webhooks.

---

## 5) Failure modes & edge cases
- Duplicate webhook deliveries → handled by idempotency.
- Out-of-order events → process by `event.created` with idempotency ledger; prefer latest subscription state.
- Payment failure (`invoice.payment_failed`) → revoke premium after grace rules (TBD; keep minimal: reflect Stripe status).
- Portal cancellation → reflected via `customer.subscription.updated/deleted`.

---

## 6) Mapping to data model
- `user` ↔ Stripe `customer`
- `subscription` ↔ Stripe `subscription`
- `billing_event` stores processed `event.id` for idempotency (see DataModel.md)

---

## 7) Non-functional requirements (billing)
- Never log secrets.
- Store minimal PII.
- Observability: log webhook event type + event.id + processing outcome (no payload dump in logs by default).
