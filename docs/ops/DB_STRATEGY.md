# DB Provisioning & Migrations (Prisma)

This project uses **Prisma + PostgreSQL**. The project is **Netlify-only** (Vercel forbidden).

## Environment variable
- `DATABASE_URL` (POSTGRESQL connection string)
- See `docs/ops/ENV_VARS.md` for names. Do **NOT** commit values.

## Local dev (recommended)
1) Run a PostgreSQL instance locally (e.g. Docker)
2) Set `DATABASE_URL` to your local connection
2) Run migrations:
   - `npm run db:migrate`
3) Seed data:
   - `npm run db:seed`

## Dev/Preview/Prod (recommended)
- Use a managed PostgreSQL provider such as Supabase or Neon
- Set `DATABASE_URL` as a Netlify env var per context (preview vs prod)

Considerations:
- Preview/prod should point to different DBs
- Apply migrations via a safe process (manual or CD); avoid auto-migrating on every request

## Migrations (how we do it)
- Schema: `prisma/schema.prisma`
- Migrations: `prisma/migrations/*`

Run:
``sh
npm run db:migrate
```

## Seeding
Seed script: `prisma/seed.ts` using fixtures under `prisma/fixtures/`.

Run:
``sh
npm run db:seed
```

## No-secrets rule
- Never commit PROD values for `DATABASE_URL`.
- Provider credentials must be set in Netlify (or local env) only.