import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Same precedence as Next.js: .env.local wins over .env. Real env vars win over both.
config({ path: [".env.local", ".env"], quiet: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx scripts/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
