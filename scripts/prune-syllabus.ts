/**
 * Removes courses/units/parts that are no longer in content/syllabus/*.yaml.
 * Usage: pnpm db:prune          (dry run: lists what would be deleted)
 *        pnpm db:prune --yes    (deletes)
 */
import { config } from "dotenv";
import path from "node:path";

config({ path: [".env.local", ".env"], quiet: true });

async function main() {
  const { createClient } = await import("@/lib/db");
  const { loadSyllabusDir } = await import("@/lib/syllabus/load");
  const { applyPrune, planPrune } = await import("@/lib/syllabus/prune");

  const db = createClient();
  try {
    const courses = await loadSyllabusDir(path.join(process.cwd(), "content/syllabus"));
    const plan = await planPrune(db, courses);
    const total = plan.courses.length + plan.units.length + plan.parts.length;
    if (total === 0) {
      console.log("Nothing to prune: the database matches content/syllabus.");
      return;
    }
    for (const [kind, slugs] of Object.entries(plan)) {
      if (slugs.length) console.log(`${kind} (${slugs.length}):\n  ${slugs.join("\n  ")}`);
    }
    if (!process.argv.includes("--yes")) {
      console.log(`\nDry run. Re-run with --yes to delete these ${total} rows.`);
      return;
    }
    await applyPrune(db, plan);
    console.log(`\nDeleted ${total} rows.`);
  } finally {
    await db.$disconnect();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
