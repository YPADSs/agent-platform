# Billing (Stripe) — Draft

## 1. Scope
Freemium + Premium subscription via Stripe:
- Stripe Checkout for purchase
- Stripe Customer Portal for management
- Webhooks for state sync

## 2. Server-side Premium gating (must)
Premium access must be enforced on the server (API/functions), not only in the UI.

## 3. Checkout flow (draft)
- User initiates upgrade → create Checkout Session (server-side)
- Redirect to Stripe Checkout
- On success/cancel → return URLs

## 4. Customer Portal (draft)
- Authenticated user requests portal session (server-side)
- Redirect to Stripe portal for cancel/update/payment method

## 5. Webhooks (must-have reliability)
### Signature verification
- Verify Stripe signature on every webhook request.

### Idempotency
- Process each event exactly-once logically by storing `event.id`.
- If event already processed → return 2xx without side effects.

### Retry safety
- Stripe retries on non-2xx; handler must be retry-safe.

### Suggested event coverage (draft)
- checkout.session.completed
- customer.subscription.created/updated/deleted
- invoice.paid / invoice.payment_failed

## 6. Data mapping (draft)
- Stripe Customer ↔ User
- Stripe Subscription ↔ Subscription record
- Entitlements computed from subscription status
