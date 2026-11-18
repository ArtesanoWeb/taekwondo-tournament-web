"use client";

import {
  Children,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { ADMIN_SECTIONS, sectionIndex } from "@/lib/swipe";

/** Phones only, like the bottom bar (Tailwind's `sm` breakpoint). */
const PHONE = "(width < 40rem)";

/** After the last scroll event, how long until the swipe counts as settled. */
const SETTLE_MS = 120;

/** The open carousel, so the bottom bar can scroll it instead of loading another page. */
let scrollToSection: ((index: number) => void) | null = null;

/**
 * For the bottom bar: on a phone with the sections carousel open, slides to `href` and returns
 * `true` (the link must not navigate); otherwise returns `false`.
 */
export function goToSection(href: string): boolean {
  const index = sectionIndex(href);
  if (!scrollToSection || index === -1) return false;
  if (!window.matchMedia(PHONE).matches) return false;
  scrollToSection(index);
  return true;
}

/**
 * On phones, the admin's sections side by side with native scroll-snap: a swipe anywhere drags
 * the real next section in with the finger. When it settles, the URL follows (`pushState`, so the
 * bottom bar and the back button know). From `sm` up, only the current section shows.
 */
export function SectionCarousel({
  current,
  children,
}: {
  current: number;
  children: ReactNode;
}) {
  const panels = Children.toArray(children);
  // Before hydrating, only the current section shows: the scroll can't be placed until then.
  const mounted = useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  );
  const [active, setActive] = useState(current);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);
  const activeRef = useRef(current);

  const left = (index: number) => panelRefs.current[index]?.offsetLeft ?? 0;

  // Start on the current section, before the first paint with every section shown.
  useLayoutEffect(() => {
    if (mounted && scrollerRef.current) {
      scrollerRef.current.scrollLeft = left(activeRef.current);
    }
  }, [mounted]);

  // The scroller is as tall as the section on screen, which grows as its data streams in.
  useEffect(() => {
    const panel = panelRefs.current[active];
    const scroller = scrollerRef.current;
    if (!panel || !scroller) return;
    const sync = () =>
      scroller.style.setProperty("--section-height", `${panel.offsetHeight}px`);
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(panel);
    return () => observer.disconnect();
  }, [active, mounted]);

  /** Makes `index` the active section; `push` adds it to the history (a swipe or a tap). */
  const activate = (index: number, push: boolean) => {
    if (index === activeRef.current) return;
    activeRef.current = index;
    setActive(index);
    if (push) window.history.pushState(null, "", ADMIN_SECTIONS[index]);
    const title = document.title.split(" · ");
    title[0] = panelRefs.current[index]?.dataset.title ?? title[0];
    document.title = title.join(" · ");
  };

  // The bottom bar slides the carousel; back and forward slide it to the URL's section.
  useEffect(() => {
    scrollToSection = (index) =>
      scrollerRef.current?.scrollTo({ left: left(index), behavior: "smooth" });
    const onPopState = () => {
      const index = sectionIndex(window.location.pathname);
      if (index === -1) return;
      activate(index, false);
      scrollerRef.current?.scrollTo({ left: left(index) });
    };
    window.addEventListener("popstate", onPopState);
    return () => {
      scrollToSection = null;
      window.removeEventListener("popstate", onPopState);
    };
  });

  const settleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const onScroll = () => {
    clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => {
      const scroller = scrollerRef.current;
      if (!scroller) return;
      let closest = 0;
      panelRefs.current.forEach((panel, index) => {
        if (
          panel &&
          Math.abs(left(index) - scroller.scrollLeft) <
            Math.abs(left(closest) - scroller.scrollLeft)
        ) {
          closest = index;
        }
      });
      activate(closest, true);
    }, SETTLE_MS);
  };
  useEffect(() => () => clearTimeout(settleTimer.current), []);

  return (
    <div
      ref={scrollerRef}
      onScroll={onScroll}
      // Below `sm`: a row of full-width sections, as tall as the active one but at least the
      // screen between the header and the bottom bar, so a swipe works anywhere.
      className="relative flex snap-x snap-mandatory [scrollbar-width:none] items-start gap-4 overflow-x-auto overflow-y-hidden max-sm:h-(--section-height) max-sm:min-h-[calc(100dvh-14rem)] sm:block sm:overflow-visible"
    >
      {panels.map((panel, index) => (
        <section
          key={ADMIN_SECTIONS[index]}
          ref={(element) => {
            panelRefs.current[index] = element;
          }}
          data-title={SECTION_TITLES[index]}
          // Off-screen sections can't be focused or read, and hide their floating buttons.
          inert={index !== active}
          data-section-panel
          data-active={index === active ? "" : undefined}
          className={`w-full shrink-0 snap-start ${
            index === current ? "" : "sm:hidden"
          } ${mounted || index === current ? "" : "hidden"}`}
        >
          {panel}
        </section>
      ))}
    </div>
  );
}

const noSubscription = () => () => {};

/** Each section's page title, as in its `metadata`. */
const SECTION_TITLES = ["Atletas", "Clubes", "Torneos", "Rankings", "Más"];
