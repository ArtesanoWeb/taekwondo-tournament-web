// The belt of each grade: its color and, for the grades in between, a stripe of the next color.
// From the lowest grade (10.º Kup, white) to Dan (black).

import type { Grade } from "@/lib/api/types";

export type BeltColor = "white" | "yellow" | "green" | "blue" | "red" | "black";

export type Belt = { color: BeltColor; stripe?: BeltColor };

/** Typed as Record<Grade, …> so a new grade in the API fails the typecheck until it has a belt. */
export const gradeBelts: Record<Grade, Belt> = {
  kup_10: { color: "white" },
  kup_9: { color: "white", stripe: "yellow" },
  kup_8: { color: "yellow" },
  kup_7: { color: "yellow", stripe: "green" },
  kup_6: { color: "green" },
  kup_5: { color: "green", stripe: "blue" },
  kup_4: { color: "blue" },
  kup_3: { color: "blue", stripe: "red" },
  kup_2: { color: "red" },
  kup_1: { color: "red", stripe: "black" },
  dan: { color: "black" },
};

/** Fill of each color (Tailwind's palette, as hex so it works inside an SVG in both themes). */
export const beltFills: Record<BeltColor, string> = {
  white: "#ffffff",
  yellow: "#facc15",
  green: "#16a34a",
  blue: "#2563eb",
  red: "#dc2626",
  black: "#18181b",
};
