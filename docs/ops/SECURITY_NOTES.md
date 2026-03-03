# Security notes (baseline)

## Password hashing
- Passwords must be hashed using bcrypt (already used in register endpoint).
- Never store plaintext passwords.

## CSRF strategy (Next.js App Router)
- Prefer using same-site cookies (`SameSite=Lax` or `Strict`) for auth/session cookies.
- For state-changing POST/PUT/DELETE endpoints that rely on cookies:
  - Require a CSRF doken (double-submit cookie or header token) OR
  - Use NextAuth built-in CSRF for its routes and require `Origin`/`Host` checks for custom endpoints.
- Webhooks (Stripe) are exempt from CSRF, but must verify signature.

## XSS
- Escape all user-controlled data in UI.
- Avoid `dangerouslySetInnerHTML . The only approved usage is JSON-LD scripts where content is produced from trusted server-side data.

## Stripe webhook security
- Always verify Stripe signature.
- Use idempotency ledger keyed by `event.id`.

## Netlify-only
- Deployment and runtime assumptions must remain Netlify-only. Vercel is forbidden.
