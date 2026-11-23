import { beltFills, gradeBelts } from "@/lib/belts";
import type { Grade } from "@/lib/api/types";
import { gradeLabels } from "@/lib/labels";

// Each piece is drawn as a fill, then the lower half in the second color (grades in between),
// then its outline on top, so the line between the halves never covers the border.
const shapes = {
  band: {
    outline:
      "M2.5 4H45.5A1.5 1.5 0 0 1 47 5.5V8.5A1.5 1.5 0 0 1 45.5 10H2.5A1.5 1.5 0 0 1 1 8.5V5.5A1.5 1.5 0 0 1 2.5 4Z",
    half: "M1 7H47V8.5A1.5 1.5 0 0 1 45.5 10H2.5A1.5 1.5 0 0 1 1 8.5Z",
  },
  // The two ends hanging from the knot, split along their length.
  leftEnd: {
    outline: "M20.5 9.5 16 18.5 19.5 19.5 23 10.5Z",
    half: "M21.75 10 17.75 19 19.5 19.5 23 10.5Z",
  },
  rightEnd: {
    outline: "M27.5 9.5 32 18.5 28.5 19.5 25 10.5Z",
    half: "M26.25 10 30.25 19 28.5 19.5 25 10.5Z",
  },
  knot: {
    outline:
      "M22 2H26A2.5 2.5 0 0 1 28.5 4.5V9.5A2.5 2.5 0 0 1 26 12H22A2.5 2.5 0 0 1 19.5 9.5V4.5A2.5 2.5 0 0 1 22 2Z",
    half: "M19.5 7H28.5V9.5A2.5 2.5 0 0 1 26 12H22A2.5 2.5 0 0 1 19.5 9.5Z",
  },
};

/**
 * A taekwondo belt in the grade's color, tied with a knot in the middle; grades in between are
 * split lengthwise, half their color and half the next one. The grade's name is its accessible
 * name and tooltip. Its outline (`currentColor`) keeps white and black belts visible in both
 * themes.
 */
export function Belt({
  grade,
  className = "h-5 w-12",
}: {
  grade: Grade;
  className?: string;
}) {
  const { color, half } = gradeBelts[grade];
  const fill = beltFills[color];
  const halfFill = half && beltFills[half];
  return (
    <svg
      role="img"
      aria-label={gradeLabels[grade]}
      viewBox="0 0 48 20"
      className={`shrink-0 text-zinc-400 dark:text-zinc-500 ${className}`}
      stroke="currentColor"
      strokeWidth={0.8}
      strokeLinejoin="round"
    >
      <title>{gradeLabels[grade]}</title>
      {Object.entries(shapes).map(([name, shape]) => (
        <g key={name}>
          <path d={shape.outline} fill={fill} stroke="none" />
          {halfFill && <path d={shape.half} fill={halfFill} stroke="none" />}
          <path d={shape.outline} fill="none" />
        </g>
      ))}
    </svg>
  );
}
