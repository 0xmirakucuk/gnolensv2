import { config } from "dotenv";
import { createClient } from "@/lib/db";

config({ path: [".env.local", ".env"], quiet: true });

export const testDatabaseUrl = process.env.TEST_DATABASE_URL;

/** Guard against pointing destructive test helpers at the dev database by mistake. */
if (testDatabaseUrl && testDatabaseUrl === process.env.DATABASE_URL) {
  throw new Error("TEST_DATABASE_URL must differ from DATABASE_URL: tests wipe the test database.");
}

export function createTestDb() {
  return createClient(testDatabaseUrl);
}

export async function resetSyllabus(db: ReturnType<typeof createClient>) {
  await db.part.deleteMany();
  await db.unit.deleteMany();
  await db.course.deleteMany();
}
