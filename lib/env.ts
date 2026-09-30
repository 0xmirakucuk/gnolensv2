import "server-only";
import { z } from "zod";

/** Comma-separated list → trimmed, lowercased, non-empty entries. */
const emailList = z
  .string()
  .default("")
  .transform((s) =>
    s
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );

const schema = z.object({
  DATABASE_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(32, "generate one with: openssl rand -base64 32"),
  BETTER_AUTH_URL: z.url(),
  ADMIN_EMAILS: emailList,
  EMAIL_FROM: z.string().min(1),
  RESEND_API_KEY: z.string().optional(),
  SMTP_HOST: z.string().default("localhost"),
  SMTP_PORT: z.coerce.number().int().default(1025),
});

export type Env = z.infer<typeof schema>;

let cached: Env | undefined;

/**
 * Validated server env. Parsed lazily (not at import) so `next build` works without
 * a full env; the first request fails fast with a readable message if anything is missing.
 */
export function env(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`);
    throw new Error(`Invalid environment variables (see .env.example):\n${issues.join("\n")}`);
  }
  cached = parsed.data;
  return cached;
}
