import "server-only";
import { db } from "@/lib/db";

/** Courses for a BEMACS year, with unit and part counts for the overview cards. */
export async function listCourses(year: number) {
  const courses = await db.course.findMany({
    where: { year },
    orderBy: { order: "asc" },
    select: {
      slug: true,
      name: true,
      code: true,
      order: true,
      draft: true,
      units: { select: { _count: { select: { parts: true } } } },
    },
  });
  return courses.map(({ units, ...course }) => ({
    ...course,
    unitCount: units.length,
    partCount: units.reduce((n, u) => n + u._count.parts, 0),
  }));
}

/** One course with its full Unit > Part outline, or null if the slug is unknown. */
export function getCourseOutline(slug: string) {
  return db.course.findUnique({
    where: { slug },
    select: {
      slug: true,
      name: true,
      code: true,
      year: true,
      order: true,
      draft: true,
      units: {
        orderBy: { order: "asc" },
        select: {
          slug: true,
          title: true,
          order: true,
          parts: { orderBy: { order: "asc" }, select: { slug: true, title: true, order: true } },
        },
      },
    },
  });
}
