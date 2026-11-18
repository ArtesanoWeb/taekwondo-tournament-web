import { beltFills, gradeBelts } from "@/lib/belts";
import type { Grade } from "@/lib/api/types";
import { gradeLabels } from "@/lib/labels";

/**
 * A taekwondo belt in the grade's color, tied with a knot in the middle; grades in between carry
 * a stripe of the next color near the ends. The grade's name is its accessible name and tooltip.
 * Its outline (`currentColor`) keeps white and black belts visible in both themes.
 */
export function Belt({
  grade,
  className = "h-5 w-12",
}: {
  grade: Grade;
  className?: string;
}) {
  const { color, stripe } = gradeBelts[grade];
  const fill = beltFills[color];
  const stripeFill = stripe && beltFills[stripe];
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
      {/* The band around the waist. */}
      <rect x={1} y={4} width={46} height={6} rx={1.5} fill={fill} />
      {stripeFill && (
        <>
          <rect x={5} y={4} width={3} height={6} fill={stripeFill} />
          <rect x={40} y={4} width={3} height={6} fill={stripeFill} />
        </>
      )}
      {/* The two ends hanging from the knot. */}
      <path d="M20.5 9.5 16 18.5 19.5 19.5 23 10.5Z" fill={fill} />
      <path d="M27.5 9.5 32 18.5 28.5 19.5 25 10.5Z" fill={fill} />
      {stripeFill && (
        <>
          <path d="M17 16.5 16 18.5 19.5 19.5 20.4 17.5Z" fill={stripeFill} />
          <path d="M31 16.5 32 18.5 28.5 19.5 27.6 17.5Z" fill={stripeFill} />
        </>
      )}
      {/* The knot. */}
      <rect x={19.5} y={2} width={9} height={10} rx={2.5} fill={fill} />
    </svg>
  );
}
