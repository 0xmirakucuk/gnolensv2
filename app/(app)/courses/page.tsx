import type { Metadata } from "next";
import Link from "next/link";
import { DraftBadge } from "@/components/draft-badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireOnboardedUser } from "@/lib/auth/session";
import { groupBySemester } from "@/lib/courses/group";
import { listCourses } from "@/lib/courses/queries";
import { courseTint } from "@/lib/courses/tint";

export const metadata: Metadata = { title: "Courses" };

// Only year-1 content exists in phase 1.
const FALLBACK_YEAR = 1;

export default async function CoursesPage() {
  const user = await requireOnboardedUser();
  let courses = await listCourses(user.year);
  const showingFallback = courses.length === 0 && user.year !== FALLBACK_YEAR;
  if (showingFallback) courses = await listCourses(FALLBACK_YEAR);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-heading-3 sm:text-heading-2">Courses</h1>
        <p className="text-body-md text-slate">
          {showingFallback
            ? `Year ${user.year} courses are not available yet. Here are the year ${FALLBACK_YEAR} courses.`
            : `BEMACS year ${user.year}`}
          {" · "}
          <Link
            href="/onboarding"
            className="text-body-sm text-link-blue active:text-link-blue-pressed font-medium"
          >
            Change year
          </Link>
        </p>
      </div>
      {groupBySemester(courses).map(({ semester, courses: group }) => (
        <section key={semester ?? "other"} className="flex flex-col gap-4">
          <div className="flex items-baseline gap-3">
            <h2 className="text-heading-5">{semester ? `Semester ${semester}` : "Other"}</h2>
            {semester !== null && semester > 1 && (
              <span className="text-body-sm text-steel">Later this year</span>
            )}
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.map((course) => (
              <li key={course.slug}>
                <Link
                  href={`/courses/${course.slug}`}
                  className="focus-visible:ring-primary/40 block h-full rounded-lg outline-none focus-visible:ring-[3px]"
                >
                  <Card
                    tint={courseTint(course.order)}
                    className="hover:shadow-card h-full p-8 transition-shadow duration-150"
                  >
                    <CardHeader className="gap-3">
                      {course.code && (
                        <span className="text-slate text-[11px] leading-[1.4] font-semibold tracking-[1px] uppercase">
                          Course {course.code}
                        </span>
                      )}
                      <CardTitle className="text-heading-4 text-ink">{course.name}</CardTitle>
                      <CardDescription className="text-charcoal flex flex-wrap items-center gap-2">
                        <span>
                          {course.unitCount} units · {course.partCount} parts
                        </span>
                        {course.draft && <DraftBadge onTint />}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {courses.length === 0 && (
        <p className="text-body-sm text-slate">No courses yet. Run `pnpm db:seed`.</p>
      )}
    </div>
  );
}
