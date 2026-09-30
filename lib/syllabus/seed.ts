import type { PrismaClient } from "@/lib/generated/prisma/client";
import type { SyllabusCourse } from "./schema";

type Tx = Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];

export type SeedReport = {
  created: { courses: number; units: number; parts: number };
  /** Slugs present in the DB but missing from the YAML. Never deleted by the seed. */
  orphaned: string[];
};

/**
 * Upserts the syllabus by slug in one transaction. Idempotent: a second run changes nothing.
 *
 * Never deletes. Rows missing from the YAML are reported as orphans and moved to the end of
 * their parent's order, because from M1 on they may have questions attached; removing them
 * is a manual decision.
 */
export async function seedSyllabus(
  db: PrismaClient,
  courses: SyllabusCourse[],
): Promise<SeedReport> {
  const report: SeedReport = {
    created: { courses: 0, units: 0, parts: 0 },
    orphaned: [],
  };

  await db.$transaction(
    async (tx) => {
      const yamlCourseSlugs = new Set(courses.map((c) => c.slug));
      const orphanCourses = await tx.course.findMany({
        where: { slug: { notIn: [...yamlCourseSlugs] } },
        select: { slug: true },
      });
      report.orphaned.push(...orphanCourses.map((c) => c.slug));

      for (const course of courses) {
        const existing = await tx.course.findUnique({
          where: { slug: course.slug },
          select: { id: true },
        });
        const data = {
          name: course.name,
          code: course.code,
          year: course.year,
          semester: course.semester,
          order: course.order,
          draft: course.draft,
        };
        const { id: courseId } = existing
          ? await tx.course.update({
              where: { id: existing.id },
              data,
              select: { id: true },
            })
          : await tx.course.create({
              data: { slug: course.slug, ...data },
              select: { id: true },
            });
        if (!existing) report.created.courses++;

        const unitIds = await syncChildren(tx, report, {
          model: "unit",
          parentField: "courseId",
          parentId: courseId,
          items: course.units,
        });

        for (const unit of course.units) {
          await syncChildren(tx, report, {
            model: "part",
            parentField: "unitId",
            parentId: unitIds.get(unit.slug)!,
            items: unit.parts,
          });
        }
      }
    },
    { timeout: 30_000 },
  );

  report.orphaned.sort();
  return report;
}

type ChildSync =
  | {
      model: "unit";
      parentField: "courseId";
      parentId: string;
      items: { slug: string; title: string; order: number }[];
    }
  | {
      model: "part";
      parentField: "unitId";
      parentId: string;
      items: { slug: string; title: string; order: number }[];
    };

/**
 * Upserts the children of one parent and assigns final orders: YAML items get 1..n, orphans
 * n+1.. (keeping their relative order). Orders are unique per parent, so this runs in two
 * phases: every existing row first moves to a negative temporary order, then to its final one.
 * Final orders are always positive, so the temporaries never collide with anything.
 */
async function syncChildren(
  tx: Tx,
  report: SeedReport,
  sync: ChildSync,
): Promise<Map<string, string>> {
  // Prisma delegates share this shape; narrowing per model would only duplicate the code.
  const delegate = (sync.model === "unit" ? tx.unit : tx.part) as unknown as {
    findMany(args: object): Promise<{ id: string; slug: string; order: number }[]>;
    update(args: object): Promise<{ id: string }>;
    create(args: object): Promise<{ id: string }>;
  };

  const existing = await delegate.findMany({
    where: { [sync.parentField]: sync.parentId },
    select: { id: true, slug: true, order: true },
    orderBy: { order: "asc" },
  });
  const existingBySlug = new Map(existing.map((row) => [row.slug, row]));
  const yamlSlugs = new Set(sync.items.map((i) => i.slug));
  const orphans = existing.filter((row) => !yamlSlugs.has(row.slug));

  const finalOrder = new Map<string, number>();
  sync.items.forEach((item) => finalOrder.set(item.slug, item.order));
  orphans.forEach((row, i) => finalOrder.set(row.slug, sync.items.length + i + 1));

  const needsReorder = existing.some((row) => row.order !== finalOrder.get(row.slug));
  if (needsReorder) {
    for (const row of existing) {
      await delegate.update({
        where: { id: row.id },
        data: { order: -finalOrder.get(row.slug)! },
      });
    }
  }
  for (const row of orphans) {
    report.orphaned.push(row.slug);
    if (needsReorder)
      await delegate.update({
        where: { id: row.id },
        data: { order: finalOrder.get(row.slug)! },
      });
  }

  const ids = new Map<string, string>();
  for (const item of sync.items) {
    const row = existingBySlug.get(item.slug);
    const data = { title: item.title, order: item.order };
    const saved = row
      ? await delegate.update({
          where: { id: row.id },
          data,
          select: { id: true },
        })
      : await delegate.create({
          data: { slug: item.slug, [sync.parentField]: sync.parentId, ...data },
          select: { id: true },
        });
    if (!row) report.created[sync.model === "unit" ? "units" : "parts"]++;
    ids.set(item.slug, saved.id);
  }
  return ids;
}
