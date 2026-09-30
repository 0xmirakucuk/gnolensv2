import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-muted-foreground text-sm">This page doesn&apos;t exist.</p>
      <Link href="/courses" className="text-sm underline underline-offset-4">
        Go to courses
      </Link>
    </main>
  );
}
