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
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3 text-center">
        <h1 className="sm:text-display-lg text-[36px] leading-[1.1] font-semibold tracking-[-1px]">
          Study what the exam asks.
        </h1>
        <p className="text-subtitle text-on-dark-muted">
          Sign in with your Bocconi student email. We&apos;ll send you a link, no password needed.
        </p>
      </div>
      <div className="border-hairline bg-canvas text-ink shadow-mockup rounded-lg border p-6 sm:p-8">
        <SignInForm linkError={linkError} />
        <p className="text-caption text-steel mt-6">
          We only store your email address and study year to run the app. No tracking or ads.
        </p>
      </div>
    </div>
  );
}
