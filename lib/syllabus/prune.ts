import type { PrismaClient } from "@/lib/generated/prisma/client";
import type { SyllabusCourse } from "./schema";

export type PrunePlan = { courses: string[]; units: string[]; parts: string[] };

/**
 * Everything in the DB that is no longer in the YAML, including the children of removed
 * units/courses. Read-only.
 */
export async function planPrune(db: PrismaClient, courses: SyllabusCourse[]): Promise<PrunePlan> {
  const keep = {
    courses: new Set(courses.map((c) => c.slug)),
    units: new Set(courses.flatMap((c) => c.units.map((u) => u.slug))),
    parts: new Set(courses.flatMap((c) => c.units.flatMap((u) => u.parts.map((p) => p.slug)))),
  };
  const [dbCourses, dbUnits, dbParts] = await Promise.all([
    db.course.findMany({ select: { slug: true }, orderBy: { slug: "asc" } }),
    db.unit.findMany({ select: { slug: true }, orderBy: { slug: "asc" } }),
    db.part.findMany({ select: { slug: true }, orderBy: { slug: "asc" } }),
  ]);
  return {
    courses: dbCourses.map((r) => r.slug).filter((s) => !keep.courses.has(s)),
    units: dbUnits.map((r) => r.slug).filter((s) => !keep.units.has(s)),
    parts: dbParts.map((r) => r.slug).filter((s) => !keep.parts.has(s)),
  };
}

/**
 * Deletes the planned rows in one transaction. Relations are `onDelete: Restrict`, so once
 * questions/mastery reference a Part (M1+), deleting it fails and nothing is removed.
 */
export async function applyPrune(db: PrismaClient, plan: PrunePlan): Promise<void> {
  await db.$transaction([
    db.part.deleteMany({ where: { slug: { in: plan.parts } } }),
    db.unit.deleteMany({ where: { slug: { in: plan.units } } }),
    db.course.deleteMany({ where: { slug: { in: plan.courses } } }),
  ]);
}
