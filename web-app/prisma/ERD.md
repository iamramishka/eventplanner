# Prisma ERD — Initial Schema

This file outlines the core relational model used by the wedding platform (initial Prisma schema).

Entities and key relations

- `User` (1) — (N) `Wedding`
  - A user may own multiple `Wedding` records (couples).

- `Wedding` (1) — (N) `Guest`, `AgendaItem`, `GalleryImage`, `Table`, `BudgetItem`, `ChecklistItem`, `ContentBlock`

- `Guest` (1) — (0..1) `GuestRsvp` — (N) `GuestRsvpMember`

- `Table` (1) — (N) `TableAssignment` — (1) `Guest`

- `BudgetCategory` (1) — (N) `BudgetItem` (optional wedding-scoped categories)

Notes
- All FK relations use `onDelete: Cascade` semantics to keep data consistent when a `Wedding` or `User` is removed.
- Many fields use JSON for flexible site settings, colors, or music settings.

How to apply migrations and seed locally

1. Create a PostgreSQL database and set `DATABASE_URL` in `.env`.

2. Generate Prisma client:

```bash
npx prisma generate
```

3. Run migrations (creates schema in the DB):

```bash
npx prisma migrate dev --name init
```

4. Seed the DB with initial data:

```bash
npm run prisma:seed
```
