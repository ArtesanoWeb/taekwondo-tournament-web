"use client";

import {
  type UIEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

/**
 * Behavior of a row of panels that swipe with native scroll-snap below `lg`, driven by a tab bar.
 * The element holding `scrollerRef` must be `relative` and use the height `h-(--panel-height)`
 * below `lg`. Panels may have a gap between them (so they don't touch mid-swipe): positions come
 * from the panels themselves.
 */
export function useSwipeTabs(initialIndex: number) {
  const [active, setActive] = useState(initialIndex);
  const scrollerRef = useRef<HTMLElement | null>(null);
  const panels = useRef<(HTMLElement | null)[]>([]);

  /** Where the scroller is when panel `index` fills it (the scroller is their offset parent). */
  const panelLeft = (index: number) => panels.current[index]?.offsetLeft ?? 0;

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    // From `lg` up there are no tabs: the panels are all visible and must start at the beginning.
    if (scroller && !window.matchMedia("(min-width: 64rem)").matches) {
      scroller.scrollLeft = panelLeft(initialIndex);
    }
  }, [initialIndex]);

  // Panels sit side by side, so without this a short one would inherit the tallest one's height.
  useEffect(() => {
    const panel = panels.current[active];
    if (panel) {
      scrollerRef.current?.style.setProperty(
        "--panel-height",
        `${panel.offsetHeight}px`,
      );
    }
  }, [active]);

  return {
    active,
    scrollerRef,
    panelRef: (index: number) => (element: HTMLElement | null) => {
      panels.current[index] = element;
    },
    goTo: (index: number) => {
      scrollerRef.current?.scrollTo({
        left: panelLeft(index),
        behavior: "smooth",
      });
    },
    onScroll: (event: UIEvent<HTMLElement>) => {
      // The active tab is the panel closest to the scroller's left edge.
      const { scrollLeft } = event.currentTarget;
      let closest = 0;
      panels.current.forEach((panel, index) => {
        if (
          panel &&
          Math.abs(panelLeft(index) - scrollLeft) <
            Math.abs(panelLeft(closest) - scrollLeft)
        ) {
          closest = index;
        }
      });
      setActive(closest);
    },
  };
}
