"use client";

import {
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

type TournamentGroup = {
  key: string;
  label: string;
  tabLabel: string;
  count: number;
  empty: string;
  cards: ReactNode;
};

type TournamentTabsProps = {
  groups: TournamentGroup[];
  initialIndex: number;
};

/**
 * Below `lg`: one group at a time, swiping with native scroll-snap or tapping the bar on top.
 * From `lg` up: every group side by side in columns.
 */
export function TournamentTabs({ groups, initialIndex }: TournamentTabsProps) {
  const [active, setActive] = useState(initialIndex);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (scroller) scroller.scrollLeft = initialIndex * scroller.clientWidth;
  }, [initialIndex]);

  // Panels sit side by side, so without this a short group would inherit the tallest one's height.
  useEffect(() => {
    const panel = panelRefs.current[active];
    if (panel) {
      scrollerRef.current?.style.setProperty(
        "--panel-height",
        `${panel.offsetHeight}px`,
      );
    }
  }, [active]);

  const goTo = (index: number) => {
    const scroller = scrollerRef.current;
    scroller?.scrollTo({
      left: index * scroller.clientWidth,
      behavior: "smooth",
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 border-b border-zinc-200 lg:hidden dark:border-zinc-800">
        {groups.map((group, index) => (
          <button
            key={group.key}
            type="button"
            aria-pressed={index === active}
            onClick={() => goTo(index)}
            className={`-mb-px border-b-2 px-1 py-3 text-sm ${
              index === active
                ? "border-blue-600 font-semibold text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-zinc-600 dark:text-zinc-400"
            }`}
          >
            {group.tabLabel} ({group.count})
          </button>
        ))}
      </div>

      <div
        ref={scrollerRef}
        onScroll={(event) => {
          const { scrollLeft, clientWidth } = event.currentTarget;
          if (clientWidth > 0) setActive(Math.round(scrollLeft / clientWidth));
        }}
        className="flex h-(--panel-height) snap-x snap-mandatory [scrollbar-width:none] items-start gap-4 overflow-x-auto overflow-y-hidden lg:grid lg:h-auto lg:grid-cols-3 lg:overflow-visible"
      >
        {groups.map((group, index) => (
          <section
            key={group.key}
            ref={(element) => {
              panelRefs.current[index] = element;
            }}
            aria-label={group.label}
            className="w-full shrink-0 snap-start pb-20 sm:pb-1 lg:pb-0"
          >
            <h2 className="mb-3 hidden text-lg font-semibold lg:block">
              {group.label} ({group.count})
            </h2>
            {group.count > 0 ? (
              <ul className="flex flex-col gap-3">{group.cards}</ul>
            ) : (
              <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
                {group.empty}
              </p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
