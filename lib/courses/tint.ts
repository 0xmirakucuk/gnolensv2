import type { CardTint } from "@/components/ui/card";

// Pastel tints from docs/DESIGN.md, assigned by course order so each course keeps one color
// across the app (like a database property color).
const COURSE_TINTS: CardTint[] = ["peach", "sky", "mint", "lavender", "rose", "yellow"];

export function courseTint(order: number): CardTint {
  return COURSE_TINTS[(order - 1) % COURSE_TINTS.length];
}
