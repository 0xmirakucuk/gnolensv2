import { AppHeader } from "@/components/app-header";
import { requireUser } from "@/lib/auth/session";

// Authenticated area. Every page below also calls requireUser/requireOnboardedUser itself,
// because layouts don't re-run on client-side navigation between sibling pages.
export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await requireUser();
  return (
    <>
      <AppHeader email={user.email} isAdmin={user.role === "ADMIN"} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </>
  );
}
