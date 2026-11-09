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
 * The element holding `scrollerRef` must use the height `h-(--panel-height)` below `lg`.
 */
export function useSwipeTabs(initialIndex: number) {
  const [active, setActive] = useState(initialIndex);
  const scrollerRef = useRef<HTMLElement | null>(null);
  const panels = useRef<(HTMLElement | null)[]>([]);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    // From `lg` up there are no tabs: the panels are all visible and must start at the beginning.
    if (scroller && !window.matchMedia("(min-width: 64rem)").matches) {
      scroller.scrollLeft = initialIndex * scroller.clientWidth;
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
      const scroller = scrollerRef.current;
      scroller?.scrollTo({
        left: index * scroller.clientWidth,
        behavior: "smooth",
      });
    },
    onScroll: (event: UIEvent<HTMLElement>) => {
      const { scrollLeft, clientWidth } = event.currentTarget;
      if (clientWidth > 0) setActive(Math.round(scrollLeft / clientWidth));
    },
  };
}
