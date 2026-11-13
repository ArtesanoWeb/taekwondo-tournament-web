"use client";

import type { ReactNode } from "react";

import { useSwipeTabs } from "@/components/use-swipe-tabs";

const iconProps = {
  "aria-hidden": true,
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const icons: Record<string, ReactNode> = {
  in_progress: (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="10" />
      <path d="m10 8 6 4-6 4Z" />
    </svg>
  ),
  open: (
    <svg {...iconProps}>
      <rect x="4" y="4" width="16" height="18" rx="2" />
      <path d="M8 2v4M16 2v4M9 13l2 2 4-4" />
    </svg>
  ),
  finished: (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="10" />
      <path d="m8 12 3 3 5-6" />
    </svg>
  ),
};

type PublicGroup = {
  key: string;
  label: string;
  tabLabel: string;
  count: number;
  empty: string;
  cards: ReactNode;
};

/**
 * Below `lg`: one group at a time, swiping or tapping the bottom bar, within thumb reach.
 * From `lg` up: the three groups side by side in columns.
 */
export function PublicTournamentTabs({
  groups,
  initialIndex,
}: {
  groups: PublicGroup[];
  initialIndex: number;
}) {
  const { active, scrollerRef, panelRef, goTo, onScroll } =
    useSwipeTabs(initialIndex);

  return (
    <>
      <div
        ref={(element) => {
          scrollerRef.current = element;
        }}
        onScroll={onScroll}
        className="relative flex h-(--panel-height) snap-x snap-mandatory [scrollbar-width:none] items-start gap-4 overflow-x-auto overflow-y-hidden lg:grid lg:h-auto lg:snap-none lg:grid-cols-3 lg:overflow-visible"
      >
        {groups.map((group, index) => (
          <section
            key={group.key}
            ref={panelRef(index)}
            aria-label={group.label}
            className="w-full shrink-0 snap-start pb-1"
          >
            <h2 className="mb-3 hidden text-xl font-semibold lg:block">
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

      <nav
        aria-label="Estado de los torneos"
        className="bg-background fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 pb-[env(safe-area-inset-bottom)] lg:hidden dark:border-zinc-800"
      >
        <ul className="grid grid-cols-3">
          {groups.map((group, index) => (
            <li key={group.key}>
              <button
                type="button"
                aria-pressed={index === active}
                onClick={() => goTo(index)}
                className={`flex h-16 w-full flex-col items-center justify-center gap-0.5 text-xs ${
                  index === active
                    ? "font-semibold text-blue-600 dark:text-blue-400"
                    : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                {icons[group.key]}
                {group.tabLabel}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
