"use client";

import type { ReactNode } from "react";

import { RestoreScrollScript } from "@/components/restore-scroll-script";
import { useSwipeTabs } from "@/components/use-swipe-tabs";

/** Where the active tab is remembered (`scroll-memory`). */
const TABS_KEY = "pestañas:admin-torneos";

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
 * Below `lg`: one group at a time, changed only with the bar on top (it scrolls to the group): a
 * sideways swipe belongs to the admin's sections (`SectionSwipe`). From `lg` up: every group side
 * by side in columns.
 */
export function TournamentTabs({ groups, initialIndex }: TournamentTabsProps) {
  const { active, scrollerRef, panelRef, goTo, onScroll } = useSwipeTabs(
    initialIndex,
    { key: TABS_KEY, count: groups.length },
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 border-b border-zinc-200 lg:hidden dark:border-zinc-800">
        {groups.map((group, index) => (
          <button
            key={group.key}
            type="button"
            aria-pressed={index === active}
            onClick={() => goTo(index)}
            className={`-mb-px border-b-2 px-1 py-3 text-sm whitespace-nowrap ${
              index === active
                ? "border-blue-600 font-semibold text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-zinc-600 dark:text-zinc-400"
            }`}
          >
            {group.tabLabel}
          </button>
        ))}
      </div>

      <div
        ref={(element) => {
          scrollerRef.current = element;
        }}
        onScroll={onScroll}
        className="relative flex h-(--panel-height) items-start gap-4 overflow-hidden lg:grid lg:h-auto lg:grid-cols-3 lg:overflow-visible"
      >
        {groups.map((group, index) => (
          <section
            key={group.key}
            ref={panelRef(index)}
            aria-label={group.label}
            className="w-full shrink-0 pb-20 sm:pb-1 lg:pb-0"
          >
            <h2 className="mb-3 hidden text-lg font-semibold lg:block">
              {group.label}
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
      <RestoreScrollScript storageKey={TABS_KEY} mode="tab" />
    </div>
  );
}
