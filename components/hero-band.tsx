import { cn } from "@/lib/utils";

// docs/DESIGN.md hero-band-dark: navy band, centered content, scattered brand-colored
// sticky-note dots as atmospheric decoration (purely decorative, hidden from assistive tech).
const DOTS = [
  "left-[8%] top-[14%] size-5 rotate-6 bg-brand-yellow",
  "left-[16%] top-[62%] size-3 -rotate-12 bg-brand-pink",
  "left-[5%] bottom-[12%] size-4 rotate-12 bg-brand-teal",
  "right-[10%] top-[18%] size-4 -rotate-6 bg-brand-orange",
  "right-[18%] top-[55%] size-6 rotate-3 bg-brand-purple-300",
  "right-[6%] bottom-[16%] size-3 rotate-45 bg-brand-green",
  "left-[34%] top-[8%] size-2.5 bg-link-blue",
  "right-[36%] bottom-[8%] size-2.5 rotate-12 bg-brand-pink",
];

export function HeroBand({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "bg-brand-navy text-on-dark relative isolate flex flex-1 items-center justify-center overflow-hidden px-4 py-16 sm:py-24",
        className,
      )}
    >
      <svg
        aria-hidden
        className="text-brand-navy-mid absolute inset-0 -z-10 size-full"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        {/* Mesh-wire lines */}
        <path
          d="M0 78 C 25 60, 45 95, 100 70"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.3"
        />
        <path
          d="M0 30 C 30 45, 60 10, 100 28"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.3"
        />
      </svg>
      {DOTS.map((dot) => (
        <span
          key={dot}
          aria-hidden
          className={cn("absolute -z-10 hidden rounded-xs opacity-90 sm:block", dot)}
        />
      ))}
      <div className="w-full max-w-md">{children}</div>
    </section>
  );
}
