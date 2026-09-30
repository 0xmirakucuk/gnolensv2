import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Check your email" };

export default async function CheckEmailPage({ searchParams }: PageProps<"/sign-in/check-email">) {
  const { email } = await searchParams;
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
      <p className="text-muted-foreground text-sm">
        We sent a sign-in link to{" "}
        {typeof email === "string" ? (
          <strong className="text-foreground">{email}</strong>
        ) : (
          "your inbox"
        )}
        . It expires in 15 minutes. If you don&apos;t see it, check the Junk / Quarantine folder.
      </p>
      <Link href="/sign-in" className="text-sm underline underline-offset-4">
        Use a different email
      </Link>
    </div>
  );
}
