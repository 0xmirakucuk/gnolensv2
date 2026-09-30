# CLAUDE.md

Project: exam-prep web app for Bocconi BEMACS students. Full product spec: `docs/SPEC.md`. Read it before any task.

## How to work in this repo

- Work one milestone at a time from `docs/SPEC.md` (section "Milestones"). Do not start the next milestone unless asked.
- Before writing code for a milestone: write a short plan to `docs/plans/M<n>.md` (files to create, schema changes, open questions). If a decision is not covered by the spec and is hard to reverse (DB schema shape, auth provider, paid services), stop and ask.
- Small, reversible decisions (component structure, naming, library helpers): decide yourself and note them in the plan file.
- Commit after each working step with a clear message. Never force-push, never rewrite history.
- A milestone is done only when its acceptance criteria pass and `pnpm lint && pnpm typecheck && pnpm test` are green.
- At the end of each milestone, append a summary to `docs/PROGRESS.md`: what was built, what was skipped, known issues, what needs a human decision.

## Stack (defaults, change only with approval)

- Next.js (App Router) + TypeScript, Tailwind, shadcn/ui
- PostgreSQL + Prisma, pgvector for embeddings
- Auth: email magic link, restricted to `@studbocconi.it`
- LLM: behind a single `lib/llm` interface so the provider (Anthropic, Mistral, OpenAI) can be swapped. No LangChain unless a concrete need appears; plain SDK calls + our own retrieval code are enough.
- Tests: Vitest for logic, Playwright for the main user flows
- Package manager: pnpm

## Rules

- Secrets only in `.env.local`, never committed. Keep `.env.example` up to date.
- Every question in the DB must have a topic tag (course > unit > part) and a `status` (`draft`, `reviewed`). Students only see `reviewed` questions, plus AI-generated ones clearly labeled as such.
- AI answers must cite the source chunk (document + page) they used. If retrieval finds nothing relevant, the AI says so instead of answering from general knowledge.
- Do not scrape or ingest copyrighted material. Ingestion only reads files placed in `content/` by a human.
- Keep UI text in English.
