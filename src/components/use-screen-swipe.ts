"use client";

import { useEffect, useRef } from "react";

import { swipeStep } from "@/lib/swipe";

/** Touches this close to a side are the system's back/forward gesture, not ours. */
const EDGE = 20;

/** Travel, in px, before deciding whether the finger is going sideways or scrolling the page. */
const AXIS_LOCK = 10;

/** True when the touch belongs to something with its own gestures or input. */
function ownsTheGesture(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  if (target.closest("dialog, input, textarea, select, [data-no-swipe]")) {
    return true;
  }
  // Anything that scrolls sideways by itself (a bracket, swiping tabs) keeps its native swipe.
  for (let el: Element | null = target; el; el = el.parentElement) {
    const { overflowX } = getComputedStyle(el);
    if (
      (overflowX === "auto" || overflowX === "scroll") &&
      el.scrollWidth > el.clientWidth + 1
    ) {
      return true;
    }
  }
  return false;
}

export type ScreenSwipeHandlers = {
  /** While the finger moves sideways: how far it is from where it started (px, right = +). */
  onDrag: (dx: number) => void;
  /** When it lifts: `1` next, `-1` previous, `0` not far enough (go back to where it was). */
  onRelease: (step: -1 | 0 | 1) => void;
};

/**
 * A sideways swipe anywhere on the screen that follows the finger, while `media` (a media query,
 * e.g. `(width < 40rem)`) matches. A gesture that starts vertical is left to the page's scroll.
 */
export function useScreenSwipe(handlers: ScreenSwipeHandlers, media: string) {
  // The latest handlers, without re-binding the listeners on every render.
  const latest = useRef(handlers);
  useEffect(() => {
    latest.current = handlers;
  });

  useEffect(() => {
    const narrow = window.matchMedia(media);
    let start: { x: number; y: number } | null = null;
    let axis: "x" | "y" | null = null;

    const onStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      axis = null;
      start =
        narrow.matches &&
        event.touches.length === 1 &&
        touch.clientX > EDGE &&
        touch.clientX < window.innerWidth - EDGE &&
        !document.querySelector("dialog[open]") &&
        !ownsTheGesture(event.target)
          ? { x: touch.clientX, y: touch.clientY }
          : null;
    };

    const onMove = (event: TouchEvent) => {
      if (!start) return;
      const touch = event.touches[0];
      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;
      if (!axis) {
        if (Math.abs(dx) < AXIS_LOCK && Math.abs(dy) < AXIS_LOCK) return;
        axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      }
      if (axis === "y") {
        start = null;
        return;
      }
      latest.current.onDrag(dx);
    };

    const onEnd = (event: TouchEvent) => {
      if (!start) return;
      const touch = event.changedTouches[0];
      const dragging = axis === "x";
      const step = swipeStep(touch.clientX - start.x, touch.clientY - start.y);
      start = null;
      axis = null;
      if (dragging) latest.current.onRelease(step);
    };

    const onCancel = () => {
      if (start && axis === "x") latest.current.onRelease(0);
      start = null;
      axis = null;
    };

    document.addEventListener("touchstart", onStart, { passive: true });
    document.addEventListener("touchmove", onMove, { passive: true });
    document.addEventListener("touchend", onEnd, { passive: true });
    document.addEventListener("touchcancel", onCancel, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onStart);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
      document.removeEventListener("touchcancel", onCancel);
    };
  }, [media]);
}
