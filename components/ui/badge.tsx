import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// docs/DESIGN.md badges: solid status badges are full pills; tag chips are 6px-rounded tints.
const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 whitespace-nowrap text-caption font-semibold [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        purple: "rounded-full bg-primary px-2.5 py-1 text-on-primary",
        pink: "rounded-full bg-brand-pink px-2.5 py-1 text-on-primary",
        orange: "rounded-full bg-brand-orange px-2.5 py-1 text-on-primary",
        "tag-purple": "rounded-sm bg-tint-lavender px-2 py-0.5 text-brand-purple-800",
        "tag-orange": "rounded-sm bg-tint-peach px-2 py-0.5 text-brand-orange-deep",
        "tag-green": "rounded-sm bg-tint-mint px-2 py-0.5 text-brand-green",
      },
    },
    defaultVariants: { variant: "tag-purple" },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
