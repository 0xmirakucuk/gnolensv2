/**
 * Seeds the syllabus taxonomy from content/syllabus/*.yaml. Safe to run repeatedly.
 * Usage: pnpm db:seed   (uses DATABASE_URL from the environment / .env.local)
 */
import { config } from "dotenv";
import path from "node:path";

config({ path: [".env.local", ".env"], quiet: true });

async function main() {
  // Imported after dotenv so the client sees DATABASE_URL.
  const { createClient } = await import("@/lib/db");
  const { loadSyllabusDir } = await import("@/lib/syllabus/load");
  const { seedSyllabus } = await import("@/lib/syllabus/seed");

  const db = createClient();
  try {
    const courses = await loadSyllabusDir(path.join(process.cwd(), "content/syllabus"));
    const report = await seedSyllabus(db, courses);
    const units = courses.reduce((n, c) => n + c.units.length, 0);
    const parts = courses.reduce((n, c) => n + c.units.reduce((m, u) => m + u.parts.length, 0), 0);
    console.log(`Syllabus: ${courses.length} courses, ${units} units, ${parts} parts.`);
    console.log(
      `Created: ${report.created.courses} courses, ${report.created.units} units, ${report.created.parts} parts.`,
    );
    const drafts = courses.filter((c) => c.draft).map((c) => c.slug);
    if (drafts.length)
      console.warn(
        `Draft outlines (not yet checked against the official syllabus): ${drafts.join(", ")}`,
      );
    if (report.orphaned.length) {
      console.warn(
        `WARNING: in the database but not in content/syllabus (not deleted, remove manually if intended):\n  ${report.orphaned.join("\n  ")}`,
      );
    }
  } finally {
    await db.$disconnect();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
