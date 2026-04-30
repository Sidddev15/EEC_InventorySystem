# EEC Inventory System

Production-grade industrial inventory system for an industrial filter manufacturing business.

This is not a generic SaaS dashboard. The application is built around factory stock correctness, configurable product variants, transaction-led inventory movement, and production stock conversion.

## Core Rules

- `ProductVariant` is the operational stock entity.
- Stock must never be updated directly from UI code.
- Every stock movement must create a transaction, update inventory, write stock ledger, and write audit history.
- API routes stay thin; business logic belongs in `src/modules`.
- Prisma access belongs in the service layer.
- AI helpers are optional guidance only and must never block user actions.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- Groq/OpenAI-compatible AI helper endpoint

## Local Setup

1. Install dependencies.

```bash
npm install
```

2. Create local environment file.

```bash
cp .env.example .env
```

3. Set `DATABASE_URL` in `.env`.

4. Generate Prisma client and apply migrations.

```bash
npm run prisma:generate
npm run prisma:migrate
```

5. Seed starter EEC data.

```bash
npm run seed
```

6. Start development.

```bash
npm run dev
```

## Verification

Run these before committing or deploying:

```bash
npm run lint
npm run typecheck
npm run build
```

## Environment Variables

See `.env.example`.

- `DATABASE_URL`: PostgreSQL connection string.
- `AUTH_SECRET`: long random secret for signed sessions.
- `AUTH_URL`: deployed app URL, such as `https://inventory.example.com`.
- `AI_API_KEY`: optional provider API key.
- `AI_MODEL`: optional model name.
- `AI_BASE_URL`: optional OpenAI-compatible base URL.

## Main Workflows

- Admin creates parent products and variants.
- Factory users add raw material through inward transactions.
- Factory users log production to consume raw material and create finished stock.
- Admin users perform controlled stock adjustments with reasons.
- Admin and corporate users audit transactions and export CSV reports.

## Deployment

Use `DEPLOYMENT.md` for the production checklist.
