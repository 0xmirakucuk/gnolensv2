import { Badge } from "@/components/ui/badge";

/** Shown while a course outline hasn't been checked against the official syllabus. */
export function DraftBadge() {
  return (
    <Badge variant="outline" title="Outline not yet checked against the official course syllabus">
      Draft outline
    </Badge>
  );
}
