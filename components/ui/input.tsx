import * as React from "react";

import { cn } from "@/lib/utils";

// docs/DESIGN.md text-input: 44px, 8px radius, hairline-strong border; focused = 2px primary
// border (drawn as border + 1px inset shadow so the layout doesn't shift).
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "border-hairline-strong bg-canvas text-body-md text-ink placeholder:text-muted disabled:bg-surface disabled:text-muted h-11 w-full min-w-0 rounded-md border px-4 py-3 transition-[border-color,box-shadow] duration-150 outline-none disabled:cursor-not-allowed",
        "focus-visible:border-primary focus-visible:shadow-[inset_0_0_0_1px_var(--color-primary)]",
        "aria-invalid:border-error aria-invalid:focus-visible:shadow-[inset_0_0_0_1px_var(--color-error)]",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
