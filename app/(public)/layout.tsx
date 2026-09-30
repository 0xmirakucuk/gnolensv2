import { BrandMark } from "@/components/brand-mark";
import { HeroBand } from "@/components/hero-band";

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="flex flex-1 flex-col">
      <HeroBand>
        <div className="mb-8 flex items-center justify-center gap-2">
          <BrandMark className="bg-on-dark text-ink" />
          <span className="text-body-md font-semibold">BEMACS Exam Prep</span>
        </div>
        {children}
      </HeroBand>
    </main>
  );
}
