# Product spec: BEMACS Exam Prep

## One line

An exam-prep web app for Bocconi BEMACS students. Students solve questions tagged to the syllabus, the app finds their weak topics, and AI generates notes and tests targeted at those topics, grounded only in course material.

## Users and scope

- Phase 1: 1st-year BEMACS only. Courses: Microeconomics, Mathematics, Computer Science.
- Later: 2nd and 3rd year BEMACS, then other programs.
- Competitors: Norton (Micro, paid, has AI questions), Studocu (shared notes, mostly AI-made). Our edge: questions mapped to the exact Bocconi syllabus and past exam style, and a weak-topic loop.

## Core loop

1. Student solves a test.
2. Each wrong answer maps to a topic (e.g. Micro > Unit 1 > Part 1).
3. Dashboard shows weak topics.
4. AI produces a short note and a targeted test for those topics.
5. Repeat.

Everything else serves this loop.

## Data model (starting point)

- `Course` > `Unit` > `Part` (syllabus taxonomy, seeded from a YAML file in `content/syllabus/`)
- `Question`: type (mcq, numeric, open, flashcard), body (Markdown + LaTeX), options, answer, explanation, partId, difficulty 1-5, source (`past_exam`, `manual`, `ai_generated`), status (`draft`, `reviewed`)
- `Test`: mode (see below), courseId, time limit, question list
- `Attempt` and `Answer`: per-user results with time spent per question
- `TopicMastery`: per user per Part, a score updated after every answer
- `Document` and `Chunk`: ingested course material with page numbers, partId, embedding
- `User`: email, year, tier

## Test modes

- Real exam simulation: `partial`, `general`. Timed, mimics real exam length and point weights. Results only at the end.
- Practice: `flashcard`, `quiz`, `guided` (Khan Academy style: one question at a time, hint, instant explanation).
- Timer optional for all practice modes.

## AI features

- Retrieval over `Chunk` table only (RAG). The model is not fine-tuned; "trained on our syllabus" means it answers from our retrieved material and cites it.
- Topic overview: per Part, a Khan Academy style summary generated from chunks, cached, reviewable by admin.
- Weak-topic notes: short note built from the user's wrong answers + relevant chunks.
- Question generation: new questions in the style of past exams for a given Part. Saved as `ai_generated`, shown with a label, and sent to the admin review queue.
- Tutor chat per question: "why is this wrong?", answered with citations.

## Admin

- Upload PDFs to `content/`, run ingestion (parse, chunk, tag to Part, embed).
- Question bank editor: import, tag, edit, approve (`draft` → `reviewed`).
- Review queue for AI-generated questions and overviews.

## Monetization

Tiered subscription via Stripe (Free / Pro). Free: limited tests per week, no AI generation. Pro: everything. Prices TBD by owner.

## Milestones

Each milestone ends with passing acceptance criteria, green tests, and an entry in `docs/PROGRESS.md`.

**M0: Scaffold**
Next.js app, Prisma + Postgres (docker-compose for local), auth restricted to `@studbocconi.it`, syllabus seed from YAML, basic layout.
Accept: a user can sign in, see the three courses and their units/parts.

**M1: Question bank + admin**
Question schema, admin editor with Markdown + LaTeX preview, CSV/JSON import, tagging, review status.
Accept: admin imports 20 sample questions, tags them, approves them.

**M2: Test engine**
All test modes, timer, scoring, results page with per-question explanation.
Accept: a student completes a timed partial simulation and a flashcard session; results are stored.

**M3: Mastery + dashboard**
TopicMastery update logic (unit tested), dashboard with weak topics, progress over time, test history.
Accept: after a test with wrong answers in Unit 2, Unit 2 shows as weak.

**M4: Ingestion + RAG**
PDF parsing, chunking, embedding, pgvector search, tutor chat with citations.
Accept: asking about a topic from an ingested PDF returns an answer citing the right page; an off-syllabus question returns "not in course material".

**M5: Personalized AI content**
Weak-topic notes, targeted test generation, topic overviews, admin review queue.
Accept: a student with weak topics clicks "practice my gaps" and gets a test drawn mostly from those Parts.

**M6: Billing**
Stripe checkout, tiers, feature gating.
Accept: Free user hits the limit and sees upgrade; test-mode payment unlocks Pro.

## Open decisions (owner decides, do not guess)

- LLM provider and budget per user
- Tier prices and limits
- Which course materials we have permission to ingest
- First partial exam date (sets the deadline for M0 to M3)
