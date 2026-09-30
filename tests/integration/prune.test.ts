import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { parseSyllabusFile } from "@/lib/syllabus/load";
import { applyPrune, planPrune } from "@/lib/syllabus/prune";
import { seedSyllabus } from "@/lib/syllabus/seed";
import { createTestDb, resetSyllabus, testDatabaseUrl } from "../setup/db";

const v1 = `
slug: micro
name: Microeconomics
year: 1
order: 1
units:
  - slug: u1
    title: Old unit
    parts:
      - { slug: p1, title: Old part }
  - slug: consumer
    title: Consumer theory
    parts:
      - { slug: budget, title: Budget }
      - { slug: removed, title: Removed part }
`;
const v2 = `
slug: micro
name: Microeconomics
year: 1
order: 1
units:
  - slug: consumer
    title: Consumer theory
    parts:
      - { slug: budget, title: Budget }
`;

describe.skipIf(!testDatabaseUrl)("prune (integration)", () => {
  const db = createTestDb();

  beforeEach(() => resetSyllabus(db));
  afterAll(() => db.$disconnect());

  it("plans removed units with their parts, and removed parts; keeps the rest", async () => {
    await seedSyllabus(db, [parseSyllabusFile("micro.yaml", v1)]);
    const current = [parseSyllabusFile("micro.yaml", v2)];
    const plan = await planPrune(db, current);
    expect(plan).toEqual({
      courses: [],
      units: ["micro.u1"],
      parts: ["micro.consumer.removed", "micro.u1.p1"],
    });

    await applyPrune(db, plan);
    expect(await planPrune(db, current)).toEqual({ courses: [], units: [], parts: [] });
    expect(await db.part.findMany({ select: { slug: true } })).toEqual([
      { slug: "micro.consumer.budget" },
    ]);
  });

  it("removes whole courses that left the YAML", async () => {
    await seedSyllabus(db, [parseSyllabusFile("micro.yaml", v1)]);
    const math = parseSyllabusFile("math.yaml", v2.replace("slug: micro", "slug: math"));
    const plan = await planPrune(db, [math]);
    expect(plan.courses).toEqual(["micro"]);
    expect(plan.units).toEqual(["micro.consumer", "micro.u1"]);
    await applyPrune(db, plan);
    expect(await db.course.count()).toBe(0);
  });
});
