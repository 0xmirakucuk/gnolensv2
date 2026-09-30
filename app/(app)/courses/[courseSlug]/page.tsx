import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DraftBadge } from "@/components/draft-badge";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requireOnboardedUser } from "@/lib/auth/session";
import { getCourseOutline } from "@/lib/courses/queries";
import { courseTint } from "@/lib/courses/tint";

export async function generateMetadata({
  params,
}: PageProps<"/courses/[courseSlug]">): Promise<Metadata> {
  const course = await getCourseOutline((await params).courseSlug);
  return { title: course?.name ?? "Course not found" };
}

export default async function CoursePage({ params }: PageProps<"/courses/[courseSlug]">) {
  await requireOnboardedUser();
  const course = await getCourseOutline((await params).courseSlug);
  if (!course) notFound();

  return (
    <div className="flex flex-col gap-8">
      <Card tint={courseTint(course.order)} className="gap-3 p-8">
        <Link
          href="/courses"
          className="text-body-sm text-link-blue active:text-link-blue-pressed font-medium"
        >
          ← All courses
        </Link>
        <h1 className="text-heading-3 text-ink sm:text-heading-2">{course.name}</h1>
        <div className="text-body-sm text-charcoal flex flex-wrap items-center gap-3">
          {course.code && <span>Course {course.code}</span>}
          <span>Year {course.year}</span>
          <span>{course.units.length} units</span>
          {course.draft && <DraftBadge onTint />}
        </div>
      </Card>

      <ol className="flex flex-col gap-4">
        {course.units.map((unit) => (
          <li key={unit.slug} data-testid="unit">
            <Card className="gap-0 p-0">
              <h2 className="border-hairline text-heading-5 flex items-center gap-3 border-b px-6 py-4">
                <Badge variant="tag-purple">Unit {unit.order}</Badge>
                {unit.title}
              </h2>
              <ol>
                {unit.parts.map((part) => (
                  <li
                    key={part.slug}
                    className="border-hairline-soft text-body-sm text-ink flex gap-3 border-b px-6 py-4 last:border-b-0"
                    data-testid="part"
                  >
                    <span className="text-steel w-8 shrink-0 tabular-nums">
                      {unit.order}.{part.order}
                    </span>
                    <span>{part.title}</span>
                  </li>
                ))}
              </ol>
            </Card>
          </li>
        ))}
      </ol>
    </div>
  );
}
