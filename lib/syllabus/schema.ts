import { z } from "zod";

/** Local slug as written in YAML: lowercase letters/digits, dash-separated. */
export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be lowercase letters/digits, dash-separated");

const partSchema = z.strictObject({
  slug: slugSchema,
  title: z.string().trim().min(1),
});

const unitSchema = z.strictObject({
  slug: slugSchema,
  title: z.string().trim().min(1),
  parts: z.array(partSchema).min(1, "a unit needs at least one part"),
});

/** One file in content/syllabus/<slug>.yaml. */
export const courseFileSchema = z
  .strictObject({
    slug: slugSchema,
    name: z.string().trim().min(1),
    code: z.string().regex(/^\d+$/, "must be digits only").optional(),
    year: z.number().int().min(1).max(3),
    order: z.number().int().min(1),
    // true while the outline has not been checked against the official course syllabus.
    draft: z.boolean().default(false),
    // Course-guide facts kept with the syllabus. Not stored in the DB yet; M2's exam simulation
    // (length, weights) is the first planned consumer.
    semester: z.union([z.literal(1), z.literal(2)]).optional(),
    credits: z.number().int().positive().optional(),
    source_year: z
      .string()
      .regex(/^\d{4}-\d{4}$/, "must look like 2025-2026")
      .optional(),
    instructor: z.string().trim().min(1).optional(),
    textbook: z.string().trim().min(1).optional(),
    exams: z.string().trim().min(1).optional(),
    units: z.array(unitSchema).min(1, "a course needs at least one unit"),
  })
  .superRefine((course, ctx) => {
    const seenUnits = new Set<string>();
    course.units.forEach((unit, u) => {
      if (seenUnits.has(unit.slug)) {
        ctx.addIssue({
          code: "custom",
          path: ["units", u, "slug"],
          message: `duplicate unit slug "${unit.slug}"`,
        });
      }
      seenUnits.add(unit.slug);
      const seenParts = new Set<string>();
      unit.parts.forEach((part, p) => {
        if (seenParts.has(part.slug)) {
          ctx.addIssue({
            code: "custom",
            path: ["units", u, "parts", p, "slug"],
            message: `duplicate part slug "${part.slug}" in unit "${unit.slug}"`,
          });
        }
        seenParts.add(part.slug);
      });
    });
  });

export type CourseFile = z.infer<typeof courseFileSchema>;

/** Course with globally unique slugs ("micro", "micro.u1", "micro.u1.p1") and 1-based order. */
export type SyllabusCourse = {
  slug: string;
  name: string;
  code: string | null;
  year: number;
  order: number;
  draft: boolean;
  units: {
    slug: string;
    title: string;
    order: number;
    parts: { slug: string; title: string; order: number }[];
  }[];
};
