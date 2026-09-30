/**
 * One-command local setup: pnpm setup:local
 *
 * 1. checks Node and Docker
 * 2. creates .env.local from .env.example with a fresh BETTER_AUTH_SECRET (never overwrites)
 * 3. starts Postgres + Mailpit (docker compose)
 * 4. applies migrations and seeds the syllabus
 *
 * Safe to re-run. Cross-platform (no shell-specific syntax).
 */
import { execFileSync, type ExecFileSyncOptions } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const run = (cmd: string, args: string[], opts: ExecFileSyncOptions = {}) =>
  execFileSync(cmd, args, { stdio: "inherit", shell: process.platform === "win32", ...opts });

function step(title: string) {
  console.log(`\n▸ ${title}`);
}

function fail(message: string): never {
  console.error(`\n✖ ${message}`);
  process.exit(1);
}

step("Checking prerequisites");
const nodeMajor = Number(process.versions.node.split(".")[0]);
if (nodeMajor < 22) fail(`Node 22+ is required (found ${process.versions.node}).`);
try {
  run("docker", ["compose", "version"], { stdio: "ignore" });
} catch {
  fail("Docker with the compose plugin is required (Docker Desktop on Mac/Windows).");
}
try {
  // `compose version` works without the daemon; this doesn't.
  run("docker", ["info"], { stdio: "ignore" });
} catch {
  fail(
    "Docker is installed but not running. Start Docker Desktop (or the docker service) and retry.",
  );
}
console.log(`  Node ${process.versions.node}, Docker OK`);

step("Environment file");
if (existsSync(".env.local")) {
  console.log("  .env.local already exists, leaving it as is");
} else {
  const secret = randomBytes(32).toString("base64");
  const env = readFileSync(".env.example", "utf8").replace(
    /^BETTER_AUTH_SECRET=""$/m,
    `BETTER_AUTH_SECRET="${secret}"`,
  );
  writeFileSync(".env.local", env);
  console.log("  created .env.local with a new BETTER_AUTH_SECRET");
}

step("Starting Postgres and Mailpit (first run downloads the images)");
try {
  run("docker", ["compose", "up", "-d", "--wait"]);
} catch {
  fail(
    "docker compose failed. If port 5432, 1025 or 8025 is already in use (e.g. a local Postgres), " +
      "stop that service, or set POSTGRES_PORT=5433 before this command and update the port in " +
      "DATABASE_URL and TEST_DATABASE_URL in .env.local.",
  );
}

step("Applying database migrations");
run("pnpm", ["exec", "prisma", "migrate", "deploy"]);

step("Seeding the syllabus from content/syllabus");
run("pnpm", ["exec", "tsx", "scripts/seed.ts"]);

console.log(`
✔ Ready.

  pnpm dev                 start the app → http://localhost:3000
  http://localhost:8025    Mailpit: sign-in emails land here (nothing is really sent)

Sign in with any name@studbocconi.it address, then open the link from Mailpit.
To sign in as admin with another address, add it to ADMIN_EMAILS in .env.local and restart pnpm dev.
`);
