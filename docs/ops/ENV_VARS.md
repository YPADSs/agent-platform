# Environment Variables (names only)

Do **NOT** commit secrets to the repo. This doc lists only the variable names.

This project is **Netlify-only** (Vercel forbidden).

## Database

- `DATABASE_URL`

## Auth (NextAuth)

- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

## Stripe

- `STRIPE_SECRET_KEY
- `STRIPE_WEBHOOK_SECRET  (webhook signing secret)
- `STRIPE_PRICE_ID`
- `STRIPE_SUCCESS_URL`
- `STRIPE_CANCEL_URL`
- `STRIPE_PORTAL_RETURN_URL`

## Public (frontend)

- `NEXT_PUBLIC_SITE_URL`

## Notes
- Build and CI should pass without secrets.
- If `DATABASE_URL` is missing, content lists fall back to mock fixtures. (see `lib/content.ts`)
