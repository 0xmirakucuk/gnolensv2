import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DraftBadge } from "@/components/draft-badge";
import { requireOnboardedUser } from "@/lib/auth/session";
import { getCourseOutline } from "@/lib/courses/queries";

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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link href="/courses" className="text-muted-foreground text-sm hover:underline">
          ← All courses
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">{course.name}</h1>
        <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
          {course.code && <span>Course {course.code}</span>}
          <span>Year {course.year}</span>
          {course.draft && <DraftBadge />}
        </div>
      </div>

      <ol className="flex flex-col gap-4">
        {course.units.map((unit) => (
          <li key={unit.slug} className="rounded-xl border" data-testid="unit">
            <h2 className="border-b px-4 py-3 font-medium">
              <span className="text-muted-foreground">Unit {unit.order}.</span> {unit.title}
            </h2>
            <ol className="divide-y">
              {unit.parts.map((part) => (
                <li key={part.slug} className="flex gap-2 px-4 py-2 text-sm" data-testid="part">
                  <span className="text-muted-foreground tabular-nums">
                    {unit.order}.{part.order}
                  </span>
                  <span>{part.title}</span>
                </li>
              ))}
            </ol>
          </li>
        ))}
      </ol>
    </div>
  );
}
