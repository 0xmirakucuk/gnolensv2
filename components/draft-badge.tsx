import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Shown while a course outline hasn't been checked against the official syllabus.
 * `onTint`: sits on a pastel card, so it gets a white chip to stay visible (the peach tag
 * would vanish on the peach course card).
 */
export function DraftBadge({ onTint = false }: { onTint?: boolean }) {
  return (
    <Badge
      variant="tag-orange"
      className={cn(onTint && "bg-canvas")}
      title="Outline not yet checked against the official course syllabus"
    >
      Draft outline
    </Badge>
  );
}
