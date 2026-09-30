import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// docs/DESIGN.md card-base / card-feature-*: 12px radius, flat (hairline border, no shadow).
// Tinted variants carry their weight through the background instead of a border.
const cardVariants = cva("flex flex-col gap-4 rounded-lg p-6", {
  variants: {
    tint: {
      none: "border border-hairline bg-canvas text-ink",
      peach: "bg-tint-peach text-charcoal",
      rose: "bg-tint-rose text-charcoal",
      mint: "bg-tint-mint text-charcoal",
      lavender: "bg-tint-lavender text-charcoal",
      sky: "bg-tint-sky text-charcoal",
      yellow: "bg-tint-yellow text-charcoal",
      "yellow-bold": "bg-tint-yellow-bold text-charcoal",
      cream: "bg-tint-cream text-charcoal",
    },
  },
  defaultVariants: { tint: "none" },
});

export type CardTint = NonNullable<VariantProps<typeof cardVariants>["tint"]>;

function Card({
  className,
  tint,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardVariants>) {
  return <div data-slot="card" className={cn(cardVariants({ tint }), className)} {...props} />;
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="card-header" className={cn("flex flex-col gap-1.5", className)} {...props} />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-title" className={cn("text-heading-5", className)} {...props} />;
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-body-sm text-slate", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn(className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-footer" className={cn("flex items-center", className)} {...props} />;
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants };
