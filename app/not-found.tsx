import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-16 text-center">
      <h1 className="text-heading-3 sm:text-heading-2">Page not found</h1>
      <p className="text-body-md text-slate">This page doesn&apos;t exist.</p>
      <Link
        href="/courses"
        className="text-body-sm text-link-blue active:text-link-blue-pressed font-medium"
      >
        Go to courses
      </Link>
    </main>
  );
}
