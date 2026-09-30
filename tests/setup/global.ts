import { execFileSync } from "node:child_process";
import { config } from "dotenv";

/** Applies migrations to the test database once per `vitest run`. */
export default function setup() {
  config({ path: [".env.local", ".env"], quiet: true });
  const url = process.env.TEST_DATABASE_URL;
  if (!url) {
    console.warn("\n[tests] TEST_DATABASE_URL is not set: integration tests will be SKIPPED.\n");
    return;
  }
  try {
    execFileSync("pnpm", ["exec", "prisma", "migrate", "deploy"], {
      env: { ...process.env, DATABASE_URL: url },
      stdio: "pipe",
      encoding: "utf8",
    });
  } catch (e) {
    const { stderr } = e as { stderr?: string };
    throw new Error(
      `Migrating the test database failed. Is Postgres running (pnpm db:up)?\n${stderr ?? e}`,
    );
  }
}
