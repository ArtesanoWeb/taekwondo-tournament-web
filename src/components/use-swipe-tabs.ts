"use client";

import {
  type UIEvent,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { recall, remember as rememberScroll } from "@/lib/scroll-memory";

const noSubscription = () => () => {};

/**
 * Behavior of a row of panels that swipe with native scroll-snap below `lg`, driven by a tab bar.
 * The element holding `scrollerRef` must be `relative` and use the height `h-(--panel-height)`
 * below `lg`. Panels may have a gap between them (so they don't touch mid-swipe): positions come
 * from the panels themselves.
 *
 * With `remember` (a key and the number of panels), the active tab is kept for this browser tab
 * (`scroll-memory`) and the row starts on it when coming back: from the first client render, and
 * on a full page load already before React (render `RestoreScrollScript` after the scroller).
 */
export function useSwipeTabs(
  initialIndex: number,
  remember?: { key: string; count: number },
) {
  // What was left, read once: afterwards every scroll saves a new value, which must not move the
  // row back. Only a valid panel index counts.
  const firstStored = useRef<number | null | undefined>(undefined);
  const readStored = () => {
    if (firstStored.current === undefined) {
      firstStored.current = remember ? recall(remember.key) : null;
    }
    const value = firstStored.current;
    return remember && value !== null && value >= 0 && value < remember.count
      ? value
      : null;
  };
  // On the server (and while hydrating) nothing is stored; on the client, what was left.
  const stored = useSyncExternalStore(noSubscription, readStored, () => null);
  const startIndex = stored ?? initialIndex;
  // Until the row is scrolled, the active tab is where it starts.
  const [scrolledTo, setScrolledTo] = useState<number | null>(null);
  const active = scrolledTo ?? startIndex;
  const scrollerRef = useRef<HTMLElement | null>(null);
  const panels = useRef<(HTMLElement | null)[]>([]);

  /** Where the scroller is when panel `index` fills it (the scroller is their offset parent). */
  const panelLeft = (index: number) => panels.current[index]?.offsetLeft ?? 0;

  // Only on mount, and from storage directly: while hydrating, `startIndex` doesn't know it yet
  // and would move the row (already placed by `RestoreScrollScript`) back to the start.
  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    // From `lg` up there are no tabs: the panels are all visible and must start at the beginning.
    if (scroller && !window.matchMedia("(min-width: 64rem)").matches) {
      scroller.scrollLeft = panelLeft(readStored() ?? initialIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Panels sit side by side, so without this a short one would inherit the tallest one's height.
  // Before painting, so the row never shows at the wrong height.
  useLayoutEffect(() => {
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
      setScrolledTo(closest);
      // Saved here, on a real change of position, never on mount: mounting must read it first.
      if (remember) rememberScroll(remember.key, closest);
    },
  };
}
