import { execFileSync } from "node:child_process";

/** Fresh test database: migrate, wipe auth data, seed the syllabus from content/. */
export default async function globalSetup() {
  const env = { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL };
  const run = (...args: string[]) => execFileSync("pnpm", args, { env, stdio: "inherit" });
  run("exec", "prisma", "migrate", "deploy");
  run("exec", "tsx", "e2e/reset-db.ts");
  run("exec", "tsx", "scripts/seed.ts");
}
