# BEMACS Exam Prep

Exam preparation for Bocconi BEMACS students: questions mapped to the syllabus, weak-topic tracking, and AI-generated notes and tests grounded in course material.

- Product spec: [`docs/SPEC.md`](docs/SPEC.md)
- How we work (for humans and agents): [`CLAUDE.md`](CLAUDE.md)
- Milestone plans: [`docs/plans/`](docs/plans/). Progress log: [`docs/PROGRESS.md`](docs/PROGRESS.md)

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind 4 + shadcn/ui · PostgreSQL 17 + pgvector · Prisma 7 · Better Auth (email magic link, `@studbocconi.it` only) · Vitest · Playwright · pnpm

## Local setup

Requirements: Node 22+, pnpm 10, Docker.

```bash
pnpm install
cp .env.example .env.local
# set BETTER_AUTH_SECRET in .env.local:  openssl rand -base64 32
# optionally add your own email to ADMIN_EMAILS
pnpm db:up          # Postgres (+ bemacs_test DB) and Mailpit
pnpm db:migrate
pnpm db:seed        # syllabus from content/syllabus/*.yaml
pnpm dev            # http://localhost:3000
```

Sign in with any `name@studbocconi.it` address. In development, no real email is sent: open Mailpit at http://localhost:8025 and click the link.

## Commands

| Command           | What it does                                                              |
| ----------------- | ------------------------------------------------------------------------- |
| `pnpm lint`       | ESLint                                                                    |
| `pnpm typecheck`  | Next route types + `tsc`                                                  |
| `pnpm test`       | Vitest: unit + DB integration tests (uses `TEST_DATABASE_URL`)            |
| `pnpm test:e2e`   | Playwright against a production build on :3100 and the test DB            |
| `pnpm format`     | Prettier                                                                  |
| `pnpm db:migrate` | Create/apply migrations in development                                    |
| `pnpm db:seed`    | Upsert the syllabus. Never deletes; reports entries missing from the YAML |
| `pnpm db:reset`   | Drop and recreate the dev database, then seed                             |
| `pnpm db:studio`  | Prisma Studio                                                             |

Done for a milestone means `pnpm lint && pnpm typecheck && pnpm test` and `pnpm test:e2e` are green.

First Playwright run: `pnpm exec playwright install chromium`.

## Editing the syllabus

One file per course in `content/syllabus/<course-slug>.yaml`. Order in the file is order in the app. Slugs (`micro`, `u1`, `p1`) are permanent IDs: questions will reference them, so change titles freely but don't rename slugs once questions exist. Run `pnpm db:seed` after editing.

## Layout

```
app/(public)/      sign-in pages
app/(app)/         authenticated pages (onboarding, courses)
app/api/auth/      Better Auth handler
lib/auth/          auth config, email allowlist rules, session helpers (requireUser)
lib/syllabus/      YAML schema, loader, seed
lib/courses/       course queries
prisma/            schema + migrations
content/syllabus/  syllabus YAML (human-edited)
tests/             Vitest (unit, integration)
e2e/               Playwright
```
