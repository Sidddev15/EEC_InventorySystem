# Architecture

UI (Next.js App Router) -> API Routes -> Domain Services -> Prisma ORM -> PostgreSQL.

Business logic belongs in `src/modules/*`. API routes stay thin. Prisma access is kept in services.
