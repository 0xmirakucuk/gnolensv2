import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = { title: "Sign in" };

const LINK_ERRORS: Record<string, string> = {
  INVALID_TOKEN: "That sign-in link has expired or was already used. Request a new one.",
  EXPIRED_TOKEN: "That sign-in link has expired. Request a new one.",
};
const GENERIC_LINK_ERROR = "Sign-in failed. Request a new link and try again.";

export default async function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  if (await getCurrentUser()) redirect("/courses");
  const { error } = await searchParams;
  const linkError =
    typeof error === "string" ? (LINK_ERRORS[error] ?? GENERIC_LINK_ERROR) : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">BEMACS Exam Prep</h1>
        <p className="text-muted-foreground text-sm">
          Sign in with your Bocconi student email. We&apos;ll send you a link, no password needed.
        </p>
      </div>
      <SignInForm linkError={linkError} />
      <p className="text-muted-foreground text-xs">
        We only store your email address and study year to run the app. No tracking or ads.
      </p>
    </div>
  );
}
