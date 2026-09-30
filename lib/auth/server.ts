import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { magicLink } from "better-auth/plugins";
import { db } from "@/lib/db";
import { magicLinkEmail, sendEmail } from "@/lib/email";
import { env } from "@/lib/env";
import { isAdminEmail, isAllowedEmail, normalizeEmail } from "./allowed-email";

export const SIGN_IN_NOT_ALLOWED =
  "Use your @studbocconi.it email address. Aliases with “+” are not accepted.";

function createAuth() {
  const { BETTER_AUTH_URL, BETTER_AUTH_SECRET, ADMIN_EMAILS } = env();

  return betterAuth({
    appName: "BEMACS Exam Prep",
    baseURL: BETTER_AUTH_URL,
    secret: BETTER_AUTH_SECRET,
    database: prismaAdapter(db, { provider: "postgresql" }),
    user: {
      additionalFields: {
        // input: false → cannot be set by the client through any auth endpoint.
        year: { type: "number", required: false, input: false },
        tier: { type: "string", required: false, defaultValue: "FREE", input: false },
        role: { type: "string", required: false, defaultValue: "STUDENT", input: false },
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 30, // 30 days
      updateAge: 60 * 60 * 24, // extend at most once a day
    },
    rateLimit: {
      enabled: true,
      storage: "database",
      modelName: "rateLimit",
    },
    hooks: {
      // Reject before any token is created or email sent.
      before: createAuthMiddleware(async (ctx) => {
        if (ctx.path !== "/sign-in/magic-link") return;
        if (!isAllowedEmail(ctx.body?.email, ADMIN_EMAILS)) {
          throw new APIError("FORBIDDEN", {
            message: SIGN_IN_NOT_ALLOWED,
            code: "EMAIL_NOT_ALLOWED",
          });
        }
        // Send the link to, and key the account by, the normalized address.
        return { context: { body: { ...ctx.body, email: normalizeEmail(ctx.body.email) } } };
      }),
    },
    databaseHooks: {
      user: {
        create: {
          // Second line of defense: no code path may create a user outside the allowlist.
          before: async (user) => {
            if (!isAllowedEmail(user.email, ADMIN_EMAILS)) return false;
            return {
              data: { ...user, role: isAdminEmail(user.email, ADMIN_EMAILS) ? "ADMIN" : "STUDENT" },
            };
          },
        },
      },
      session: {
        create: {
          // Keep the role in sync with ADMIN_EMAILS on every sign-in (adding or removing an admin
          // takes effect at their next sign-in).
          after: async (session) => {
            const user = await db.user.findUnique({ where: { id: session.userId } });
            if (!user) return;
            const role = isAdminEmail(user.email, ADMIN_EMAILS) ? "ADMIN" : "STUDENT";
            if (user.role !== role)
              await db.user.update({ where: { id: user.id }, data: { role } });
          },
        },
      },
    },
    plugins: [
      magicLink({
        expiresIn: 60 * 15,
        storeToken: "hashed",
        sendMagicLink: async ({ email, url }) => {
          await sendEmail(magicLinkEmail(email, url));
        },
      }),
      // Lets server actions set auth cookies. Must be the last plugin.
      nextCookies(),
    ],
  });
}

let instance: ReturnType<typeof createAuth> | undefined;

/** Created on first use so `next build` does not need the runtime env. */
export function getAuth() {
  return (instance ??= createAuth());
}
