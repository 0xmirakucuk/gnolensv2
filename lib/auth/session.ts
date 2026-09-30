import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/lib/db";
import { getAuth } from "./server";

/**
 * Data access layer for auth. Pages and server actions call these; the proxy only does an
 * optimistic cookie check and is not the security boundary.
 */
export const getCurrentUser = cache(async () => {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) return null;
  // Read from the DB rather than the session payload so role/tier/year are always current.
  return db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, year: true, tier: true, role: true },
  });
});

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

/** Signed in, any onboarding state. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  return user;
}

/** Signed in and onboarded (year chosen). */
export async function requireOnboardedUser(): Promise<CurrentUser & { year: number }> {
  const user = await requireUser();
  if (user.year === null) redirect("/onboarding");
  return { ...user, year: user.year };
}
