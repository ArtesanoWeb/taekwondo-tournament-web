// Shared by the header's static shell (`SiteHeader`) and its route-aware version (`HeaderFrame`).
export const headerClass = "border-b border-zinc-200 dark:border-zinc-800";
export const headerRowClass =
  "mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:py-3";

/** The round icon buttons on the right of the header (theme, and logout on the admin's phone). */
export const headerActionsClass = "flex shrink-0 items-center gap-2";
export const themeToggleClass =
  "flex size-10 items-center justify-center rounded-full border border-zinc-300 text-zinc-700 hover:bg-zinc-100 active:bg-zinc-200 sm:size-8 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:active:bg-zinc-800";
