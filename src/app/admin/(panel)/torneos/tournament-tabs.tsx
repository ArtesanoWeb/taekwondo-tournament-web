"use client";

import type { ReactNode } from "react";

import { useSwipeTabs } from "@/components/use-swipe-tabs";

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
  const { active, scrollerRef, panelRef, goTo, onScroll } =
    useSwipeTabs(initialIndex);

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
        ref={(element) => {
          scrollerRef.current = element;
        }}
        onScroll={onScroll}
        className="flex h-(--panel-height) snap-x snap-mandatory [scrollbar-width:none] items-start gap-4 overflow-x-auto overflow-y-hidden lg:grid lg:h-auto lg:grid-cols-3 lg:overflow-visible"
      >
        {groups.map((group, index) => (
          <section
            key={group.key}
            ref={panelRef(index)}
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
