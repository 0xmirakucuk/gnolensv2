import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "yaml";
import { courseFileSchema, type SyllabusCourse } from "./schema";

export class SyllabusError extends Error {
  override name = "SyllabusError";
}

/** Validates one YAML file and expands local slugs to global ones. Throws SyllabusError. */
export function parseSyllabusFile(fileName: string, text: string): SyllabusCourse {
  let raw: unknown;
  try {
    raw = parse(text);
  } catch (e) {
    throw new SyllabusError(`${fileName}: invalid YAML: ${(e as Error).message}`);
  }
  const result = courseFileSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues.map(
      (i) => `  ${fileName}: ${formatPath(i.path)}${i.path.length ? " " : ""}${i.message}`,
    );
    throw new SyllabusError(`Invalid syllabus file:\n${issues.join("\n")}`);
  }
  const course = result.data;
  const expectedFile = `${course.slug}.yaml`;
  if (path.basename(fileName) !== expectedFile) {
    throw new SyllabusError(
      `${fileName}: course slug "${course.slug}" must match the file name (${expectedFile})`,
    );
  }
  return {
    slug: course.slug,
    name: course.name,
    code: course.code ?? null,
    year: course.year,
    semester: course.semester ?? null,
    order: course.order,
    draft: course.draft,
    units: course.units.map((unit, u) => {
      const unitSlug = `${course.slug}.${unit.slug}`;
      return {
        slug: unitSlug,
        title: unit.title,
        order: u + 1,
        parts: unit.parts.map((part, p) => ({
          slug: `${unitSlug}.${part.slug}`,
          title: part.title,
          order: p + 1,
        })),
      };
    }),
  };
}

/** Loads every *.yaml in `dir`, sorted by course order. Rejects duplicate course slugs/orders. */
export async function loadSyllabusDir(dir: string): Promise<SyllabusCourse[]> {
  const files = (await readdir(dir)).filter((f) => f.endsWith(".yaml")).sort();
  if (files.length === 0) throw new SyllabusError(`${dir}: no .yaml files found`);
  const courses = await Promise.all(
    files.map(async (f) => parseSyllabusFile(f, await readFile(path.join(dir, f), "utf8"))),
  );
  assertUniqueCourses(courses);
  return courses.sort((a, b) => a.order - b.order);
}

export function assertUniqueCourses(courses: SyllabusCourse[]) {
  const orders = new Map<number, string>();
  for (const c of courses) {
    const other = orders.get(c.order);
    if (other)
      throw new SyllabusError(`courses "${other}" and "${c.slug}" both have order ${c.order}`);
    orders.set(c.order, c.slug);
  }
}

function formatPath(p: PropertyKey[]): string {
  return p
    .map((k, i) => (typeof k === "number" ? `[${k}]` : `${i ? "." : ""}${String(k)}`))
    .join("");
}
