import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { SignOutButton } from "./sign-out-button";

export function AppHeader({ email, isAdmin }: { email: string; isAdmin: boolean }) {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4">
        <Link href="/courses" className="font-semibold tracking-tight">
          BEMACS Exam Prep
        </Link>
        <div className="flex min-w-0 items-center gap-2">
          {isAdmin && <Badge variant="secondary">Admin</Badge>}
          <span
            className="text-muted-foreground hidden truncate text-sm sm:inline"
            data-testid="user-email"
          >
            {email}
          </span>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
