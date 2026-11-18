// Whole-screen swipes on phones: which gestures count.

/** Minimum horizontal travel, in px, for a gesture to count as a swipe. */
export const MIN_SWIPE_DISTANCE = 60;

/**
 * `1` to go to the next item (finger moved left), `-1` to the previous one (finger moved right),
 * `0` when it isn't a swipe: too short, or more vertical than horizontal (scrolling the page).
 */
export function swipeStep(dx: number, dy: number): -1 | 0 | 1 {
  if (Math.abs(dx) < MIN_SWIPE_DISTANCE) return 0;
  if (Math.abs(dx) < 1.5 * Math.abs(dy)) return 0;
  return dx < 0 ? 1 : -1;
}
