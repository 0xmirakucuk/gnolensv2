import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Variants map 1:1 to docs/DESIGN.md components (button-primary, button-dark, ...).
// Buttons are 8px rectangles, never pills.
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-button-md transition-colors duration-150 outline-none focus-visible:ring-[3px] focus-visible:ring-primary/40 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-on-primary active:bg-primary-pressed disabled:bg-hairline disabled:text-muted",
        dark: "bg-ink-deep text-on-dark active:bg-ink disabled:bg-hairline disabled:text-muted",
        secondary:
          "border border-hairline-strong bg-transparent text-ink active:bg-surface disabled:text-muted",
        onDark: "bg-on-dark text-ink active:bg-surface disabled:opacity-60",
        secondaryOnDark:
          "border border-on-dark-muted bg-transparent text-on-dark active:bg-white/10 disabled:opacity-60",
        ghost: "rounded-sm bg-transparent text-ink active:bg-surface disabled:text-muted",
        link: "h-auto p-0 text-body-sm font-medium text-link-blue active:text-link-blue-pressed",
        destructive: "bg-error text-on-primary disabled:bg-hairline disabled:text-muted",
      },
      size: {
        default: "h-10 px-[18px] py-[10px]",
        sm: "h-8 px-3 py-2",
        lg: "h-11 px-5",
        icon: "size-10",
      },
    },
    compoundVariants: [
      { variant: "ghost", size: "default", className: "h-9 px-3 py-2" },
      { variant: "link", className: "h-auto px-0 py-0" },
    ],
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
