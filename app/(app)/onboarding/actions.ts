"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

const yearSchema = z.coerce.number().int().min(1).max(3);

export async function saveYear(formData: FormData) {
  const user = await requireUser();
  const year = yearSchema.safeParse(formData.get("year"));
  if (!year.success) redirect("/onboarding?error=year");
  await db.user.update({ where: { id: user.id }, data: { year: year.data } });
  redirect("/courses");
}
