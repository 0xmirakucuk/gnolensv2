import type { Metadata } from "next";
import Link from "next/link";
import { DraftBadge } from "@/components/draft-badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireOnboardedUser } from "@/lib/auth/session";
import { listCourses } from "@/lib/courses/queries";

export const metadata: Metadata = { title: "Courses" };

// Only year-1 content exists in phase 1.
const FALLBACK_YEAR = 1;

export default async function CoursesPage() {
  const user = await requireOnboardedUser();
  let courses = await listCourses(user.year);
  const showingFallback = courses.length === 0 && user.year !== FALLBACK_YEAR;
  if (showingFallback) courses = await listCourses(FALLBACK_YEAR);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Courses</h1>
        <p className="text-muted-foreground text-sm">
          {showingFallback
            ? `Year ${user.year} courses are not available yet. Here are the year ${FALLBACK_YEAR} courses.`
            : `BEMACS year ${user.year}`}{" "}
          <Link href="/onboarding" className="underline underline-offset-4">
            Change year
          </Link>
        </p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <li key={course.slug}>
            <Link
              href={`/courses/${course.slug}`}
              className="focus-visible:ring-ring/50 block h-full rounded-xl outline-none focus-visible:ring-[3px]"
            >
              <Card className="hover:bg-accent/50 h-full transition-colors">
                <CardHeader>
                  <CardTitle className="leading-snug">{course.name}</CardTitle>
                  <CardDescription className="flex flex-wrap items-center gap-2">
                    {course.code && <span>{course.code}</span>}
                    <span>
                      {course.unitCount} units · {course.partCount} parts
                    </span>
                    {course.draft && <DraftBadge />}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
      {courses.length === 0 && (
        <p className="text-muted-foreground text-sm">No courses yet. Run `pnpm db:seed`.</p>
      )}
    </div>
  );
}
