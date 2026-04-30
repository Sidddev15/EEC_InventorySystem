# Deployment

Use this checklist for repeat deployment to Vercel with Neon, Supabase, or another managed PostgreSQL provider.

## Required Environment Variables

Set these in the deployment platform:

```env
DATABASE_URL=
AUTH_SECRET=
AUTH_URL=
AI_API_KEY=
AI_MODEL=
AI_BASE_URL=
```

Recommended defaults:

```env
AI_MODEL="llama-3.1-8b-instant"
AI_BASE_URL="https://api.groq.com/openai/v1"
```

`AI_API_KEY` may be blank. The app falls back to deterministic helper text when AI is not configured.

## Database

1. Create a PostgreSQL database.
2. Add the production connection string as `DATABASE_URL`.
3. Run migrations:

```bash
npm run prisma:migrate:deploy
```

4. Seed required starter data:

```bash
npm run seed
```

## Build Check

Run locally before pushing:

```bash
npm run lint
npm run typecheck
npm run build
```

## Vercel Notes

- Build command: `npm run build`
- Install command: `npm install`
- Output is handled by Next.js.
- Do not put real secrets in `.env.example`.
- Do not deploy without running migrations and seed data.

## Production Checklist

- Admin login works.
- Product creation works.
- Variant creation works and uses correct unit/inventory type.
- Raw material inward creates transaction, inventory update, ledger, and audit log.
- Production entry consumes raw material and increases finished goods in one database transaction.
- Inventory tables show updated stock by variant and location.
- Transaction log shows every movement.
- CSV exports download.
- Factory mobile panel exposes the main operational actions.
- AI helpers work or fall back without blocking users.
