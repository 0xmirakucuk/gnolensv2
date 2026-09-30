import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Check your email" };

export default async function CheckEmailPage({ searchParams }: PageProps<"/sign-in/check-email">) {
  const { email } = await searchParams;
  return (
    <div className="border-hairline bg-canvas text-ink shadow-mockup flex flex-col gap-4 rounded-lg border p-6 sm:p-8">
      <h1 className="text-heading-4">Check your email</h1>
      <p className="text-body-md text-charcoal">
        We sent a sign-in link to{" "}
        {typeof email === "string" ? (
          <strong className="font-semibold">{email}</strong>
        ) : (
          "your inbox"
        )}
        . It expires in 15 minutes. If you don&apos;t see it, check the Junk / Quarantine folder.
      </p>
      <Link
        href="/sign-in"
        className="text-body-sm text-link-blue active:text-link-blue-pressed font-medium"
      >
        Use a different email
      </Link>
    </div>
  );
}
