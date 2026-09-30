import { createClient } from "@/lib/db";

// Run by global-setup with DATABASE_URL pointing at the test database.
if (!process.env.DATABASE_URL?.includes("_test")) {
  throw new Error(`Refusing to wipe a database whose name doesn't contain "_test".`);
}

async function main() {
  const db = createClient();
  await db.$transaction([
    db.session.deleteMany(),
    db.account.deleteMany(),
    db.verification.deleteMany(),
    db.rateLimit.deleteMany(),
    db.user.deleteMany(),
  ]);
  await db.$disconnect();
}

main();
