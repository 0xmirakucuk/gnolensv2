import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { parseSyllabusFile } from "@/lib/syllabus/load";
import type { SyllabusCourse } from "@/lib/syllabus/schema";
import { seedSyllabus } from "@/lib/syllabus/seed";
import { createTestDb, resetSyllabus, testDatabaseUrl } from "../setup/db";

const yaml = `
slug: micro
name: Microeconomics
year: 1
order: 1
units:
  - slug: u1
    title: Consumer choice
    parts:
      - { slug: p1, title: Preferences }
      - { slug: p2, title: Budget }
  - slug: u2
    title: Production
    parts:
      - { slug: p1, title: Costs }
`;

describe.skipIf(!testDatabaseUrl)("seedSyllabus (integration)", () => {
  const db = createTestDb();
  const base = () => parseSyllabusFile("micro.yaml", yaml);

  async function snapshot() {
    return db.course.findMany({
      orderBy: { order: "asc" },
      select: {
        slug: true,
        name: true,
        order: true,
        units: {
          orderBy: { order: "asc" },
          select: {
            slug: true,
            title: true,
            order: true,
            parts: {
              orderBy: { order: "asc" },
              select: { slug: true, title: true, order: true },
            },
          },
        },
      },
    });
  }

  beforeEach(() => resetSyllabus(db));
  afterAll(() => db.$disconnect());

  it("creates everything on first run", async () => {
    const report = await seedSyllabus(db, [base()]);
    expect(report).toEqual({
      created: { courses: 1, units: 2, parts: 3 },
      orphaned: [],
    });
    const [course] = await snapshot();
    expect(course.units.map((u) => u.slug)).toEqual(["micro.u1", "micro.u2"]);
  });

  it("is idempotent: a second run creates nothing and keeps ids", async () => {
    await seedSyllabus(db, [base()]);
    const idsBefore = await db.part.findMany({
      select: { id: true, slug: true },
      orderBy: { slug: "asc" },
    });
    const before = await snapshot();
    const report = await seedSyllabus(db, [base()]);
    expect(report.created).toEqual({ courses: 0, units: 0, parts: 0 });
    expect(await snapshot()).toEqual(before);
    expect(
      await db.part.findMany({
        select: { id: true, slug: true },
        orderBy: { slug: "asc" },
      }),
    ).toEqual(idsBefore);
  });

  it("updates titles in place (same id)", async () => {
    await seedSyllabus(db, [base()]);
    const { id } = await db.part.findUniqueOrThrow({
      where: { slug: "micro.u1.p1" },
    });
    const renamed = base();
    renamed.units[0].parts[0].title = "Preference relations";
    await seedSyllabus(db, [renamed]);
    const part = await db.part.findUniqueOrThrow({
      where: { slug: "micro.u1.p1" },
    });
    expect(part).toMatchObject({ id, title: "Preference relations" });
  });

  it("swaps order without tripping the unique (parent, order) constraint", async () => {
    await seedSyllabus(db, [base()]);
    const swapped: SyllabusCourse = base();
    swapped.units[0].parts.reverse().forEach((p, i) => (p.order = i + 1));
    await seedSyllabus(db, [swapped]);
    const [course] = await snapshot();
    expect(course.units[0].parts.map((p) => [p.slug, p.order])).toEqual([
      ["micro.u1.p2", 1],
      ["micro.u1.p1", 2],
    ]);
  });

  it("never deletes: removed items are reported as orphans and moved to the end", async () => {
    await seedSyllabus(db, [base()]);
    const trimmed = base();
    trimmed.units[0].parts.splice(0, 1); // drop micro.u1.p1
    trimmed.units[0].parts[0].order = 1;
    const report = await seedSyllabus(db, [trimmed]);
    expect(report.orphaned).toEqual(["micro.u1.p1"]);
    const [course] = await snapshot();
    expect(course.units[0].parts.map((p) => [p.slug, p.order])).toEqual([
      ["micro.u1.p2", 1],
      ["micro.u1.p1", 2],
    ]);
    // Running again with orphans present is still stable.
    expect((await seedSyllabus(db, [trimmed])).orphaned).toEqual(["micro.u1.p1"]);
    expect(await snapshot()).toEqual([course]);
  });

  it("reports whole courses missing from the YAML", async () => {
    await seedSyllabus(db, [base()]);
    const other = { ...base(), slug: "math", order: 2, units: [] };
    const report = await seedSyllabus(db, [other]);
    expect(report.orphaned).toContain("micro");
    expect(await db.course.count()).toBe(2);
  });

  it("rolls back everything if one write fails", async () => {
    const bad = base();
    // Two units claiming the same order violate the unique constraint mid-transaction.
    bad.units[1].order = 1;
    await expect(seedSyllabus(db, [bad])).rejects.toThrow();
    expect(await db.course.count()).toBe(0);
  });
});
