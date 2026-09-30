# Progress

## M0: Scaffold (done 2026-09-30)

**Acceptance: a user can sign in, see the three courses and their units/parts.** Met. Covered end to end by `e2e/auth.spec.ts` and `e2e/courses.spec.ts`, which sign in through a real emailed magic link and compare the course pages against `content/syllabus/*.yaml`.

Gate: `pnpm lint && pnpm typecheck && pnpm test` green (49 tests). `pnpm test:e2e` green (9 tests). CI workflow added: `.github/workflows/ci.yml`.

### Built

- Next.js 16 (App Router) + TypeScript strict, Tailwind 4, shadcn/ui base components, Prettier, ESLint.
- Postgres 17 + pgvector image and Mailpit via `docker-compose.yml`. Prisma 7.10 with the pg driver adapter. Migrations `init` and `auth_rate_limit`.
- Syllabus: `Course > Unit > Part` seeded from `content/syllabus/{micro,math,cs}.yaml`.
  - YAML is strictly validated; errors name the file and field.
  - Seeding is an idempotent upsert by slug, runs in one transaction and never deletes; entries removed from the YAML are reported as orphans.
  - `pnpm db:seed`.
- Auth: Better Auth magic link.
  - Only exact `@studbocconi.it` addresses may sign in, checked before any email is sent and again when a user is created. No `+` aliases.
  - Admins come from the `ADMIN_EMAILS` allowlist.
  - Links last 15 minutes, work once, and are stored hashed.
  - Rate limits: per IP (stored in the DB) and 3 links per address per 10 minutes.
  - Sessions last 30 days, rolling.
- Email: Resend when `RESEND_API_KEY` is set, otherwise SMTP to Mailpit.
- Pages:
  - `/sign-in`, `/sign-in/check-email`
  - `/onboarding` (BEMACS year, asked at first sign-in)
  - `/courses`, `/courses/[slug]` (Unit > Part outline)
  - 404 page
  - Header with email, admin badge and sign out.
- Tests:
  - Unit: email rules, syllabus loader.
  - DB integration: seed idempotency, reorder, orphans, rollback.
  - Playwright: 9 flows.

### Skipped / deferred

- **Real course outlines.** The three YAML files are **drafts** I wrote (`draft: true`, shown in the UI as "Draft outline") with the correct names and codes. The units and parts must be replaced from the official 2026/27 course syllabi before M1 tags questions to them.
- Changing your email or deleting your account: not in the spec for M0.
- Deployment: no hosting chosen yet, so nothing is deployed.

### Known issues

- `pnpm build` needs `DATABASE_URL` set, because the Prisma client is created when the module loads. That's normal for Prisma apps; CI and any host set it.
- The per-IP rate limit trusts `x-forwarded-for`. That's safe on hosts that overwrite the header (e.g. Vercel). The per-address cap protects inboxes either way.
- Removing an address from `ADMIN_EMAILS` demotes it at that person's next sign-in. An existing admin session keeps its old role until then, but `getCurrentUser()` reads the role from the DB, so demoting someone directly in the DB takes effect immediately.
- The CI workflow was checked by running the same commands locally (Docker Postgres + Mailpit). It had not yet run on GitHub when this entry was written.

### Needs a human decision

1. **Official units and parts** for 30403, 30400 (Module 1) and 30398. Paste the syllabus sections, or edit `content/syllabus/*.yaml` directly, then set `draft: false`. Slugs become permanent once M1 tags questions to them.
2. **Hosting + Postgres provider** (must support pgvector), before the first deploy. Resend also needs the domain verified (SPF/DKIM/DMARC) to get into Microsoft 365 inboxes, which `studbocconi.it` uses.
3. **Privacy note wording.** The sign-in page says we store only email and year, with no tracking. Confirm or replace it before launch (GDPR).

## Design update: DESIGN.md adopted (2026-09-30)

The owner provided `docs/DESIGN.md`, which is now the only UI source of truth (rule added to CLAUDE.md).

- **Tokens:** every color, radius, shadow and type-scale token is in `app/globals.css`. shadcn's semantic names (`primary`, `border`, `ring`, ...) point at them, so generated components match the spec.
- **Components** restyled to the spec:
  - Buttons: purple `primary`, 8px rectangles, 40px tall.
  - Inputs: 44px, 2px purple focus border.
  - Cards: 12px radius with a hairline border, or a pastel `tint`.
  - Badges: pill status badges and 6px tag chips.
- **Screens:**
  - Sign-in and check-email use the navy hero band with sticky-note dots and a white card with the deep "mockup" shadow.
  - The app pages use the 64px white top navigation.
  - Each course keeps one pastel tint on the list and on its page: peach for Micro, sky for Math, mint for CS.
  - Units carry lavender "Unit n" tag chips.
- **Gaps and choices:**
  - **Font:** Notion Sans is proprietary, so we use Inter, the first fallback DESIGN.md lists, from a local package.
  - **Dark mode:** DESIGN.md defines no dark-mode tokens, so the app is light-only for now; the old OS dark mode was removed.
  - **tailwind-merge** was taught the custom `text-*` sizes so they aren't dropped when merged with text colors.
- All tests pass: lint, typecheck, 50 Vitest tests, 9 Playwright tests.

## Syllabus: official course topics (2026-09-30)

The owner provided `bemacs-year1.yaml`, a summary of the Bocconi course guides. `content/syllabus/` now follows it.

- **Microeconomics (30403):** 7 units, 23 parts from the official topics (2025-26 guide). No longer a draft.
- **Fundamentals of CS (30398):** Theory, Programming 1 and Programming 2, 13 parts (2023-24 guide, the newest readable one). No longer a draft.
- **Mathematics – Module 1 (30400):** the official page lists only 3 areas and a few techniques, so it has 4 units and 6 parts and **stays a draft**. The real breakdown must come from the lecture notes.
- **New course, Statistics – Module 2 (30401):** 9 units, 38 parts, semester 2, from the 2024-25 guide.
- **Slugs:** units and parts now have descriptive slugs (e.g. `micro.consumer-theory.elasticities`) instead of `u1`/`p1`, so reordering never makes an ID misleading. Safe to change now because nothing references them yet.
- **Course-guide facts:** semester, credits, source year, instructor, textbook and exam format are kept in the YAML and validated, but not stored in the DB (no schema change). M2's exam simulation is the first planned use.
- **`pnpm db:prune`:** lists syllabus rows that are no longer in the YAML, and `--yes` deletes them in one transaction. The FK `Restrict` makes it fail safely once questions exist. E2E setup now rebuilds the syllabus in the test DB from scratch.
- All tests pass: 54 Vitest, 9 Playwright.

### Needs a human decision

1. **Statistics in phase 1?** The spec's phase 1 lists three courses (Micro, Math, CS). 30401 is part of the same "Mathematics and Statistics" course, but it's a 4th course in the app. Keep it, or remove `content/syllabus/stats.yaml` and run `pnpm db:prune --yes`.
2. **Mathematics outline:** needs the unit/part breakdown from the lecture notes.
3. **Source years:** Micro is from 2025-26, Math and Stats from 2024-25, CS from 2023-24. Re-check against the 2026/27 guides when they're published.
