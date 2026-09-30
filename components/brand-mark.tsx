import { cn } from "@/lib/utils";

/** App mark: ink square with a "B". Kept deliberately plain; no third-party brand assets. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "bg-ink-deep text-body-sm text-on-dark inline-flex size-7 items-center justify-center rounded-md font-semibold",
        className,
      )}
    >
      B
    </span>
  );
}
