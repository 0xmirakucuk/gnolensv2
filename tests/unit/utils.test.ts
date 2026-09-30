import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges conflicting tailwind classes, last one wins", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("treats DESIGN.md type sizes as font sizes, not colors", () => {
    expect(cn("text-heading-5", "text-heading-4 text-ink")).toBe("text-heading-4 text-ink");
    expect(cn("text-body-sm text-slate", "text-charcoal")).toBe("text-body-sm text-charcoal");
  });
});
