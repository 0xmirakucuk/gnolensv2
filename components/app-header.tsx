import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { Badge } from "@/components/ui/badge";
import { SignOutButton } from "./sign-out-button";

// docs/DESIGN.md top navigation: sticky white bar, ~64px, hairline bottom border.
export function AppHeader({ email, isAdmin }: { email: string; isAdmin: boolean }) {
  return (
    <header className="border-hairline bg-canvas sticky top-0 z-10 border-b">
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-8">
        <Link
          href="/courses"
          className="text-body-md text-ink flex items-center gap-2 font-semibold"
        >
          <BrandMark />
          BEMACS Exam Prep
        </Link>
        <div className="flex min-w-0 items-center gap-3">
          {isAdmin && <Badge variant="tag-purple">Admin</Badge>}
          <span
            className="text-body-sm text-steel hidden truncate sm:inline"
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
