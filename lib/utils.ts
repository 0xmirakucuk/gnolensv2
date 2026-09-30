import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Teach tailwind-merge the DESIGN.md type scale (app/globals.css --text-*). Without this it
// reads `text-heading-4` as a color and drops it when merged with e.g. `text-ink`.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        "hero-display",
        "display-lg",
        "heading-1",
        "heading-2",
        "heading-3",
        "heading-4",
        "heading-5",
        "subtitle",
        "body-md",
        "body-sm",
        "caption",
        "micro",
        "button-md",
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
