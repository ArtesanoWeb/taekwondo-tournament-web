import Link from "next/link";
import type { ReactNode } from "react";

const iconProps = {
  "aria-hidden": true,
  className: "size-6",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const icons = {
  back: (
    <svg {...iconProps}>
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  ),
  close: (
    <svg {...iconProps}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  ),
};

type TitleBarProps = {
  title: ReactNode;
  /** Where the way out leads, and its name ("Torneos", the tournament…). */
  parentHref: string;
  parentLabel: string;
  /** `close` for full-screen forms, `back` for detail pages. */
  icon?: keyof typeof icons;
  /** A line under the title, such as the category's details. */
  subtitle?: ReactNode;
};

/**
 * The title of a detail screen or full-screen form. On phones the site header is hidden on these screens (see
 * `HeaderFrame`), so the title becomes the screen's bar: the way out on its left and a
 * full-width line under it, with the subtitle below that line. On larger screens it's a
 * "← parent" link above the title.
 */
export function TitleBar({
  title,
  parentHref,
  parentLabel,
  icon = "back",
  subtitle,
}: TitleBarProps) {
  return (
    <header className="flex flex-col gap-1 max-sm:gap-4">
      <div className="flex flex-col gap-1 max-sm:-mx-4 max-sm:border-b max-sm:border-zinc-200 max-sm:px-4 max-sm:pb-4 dark:max-sm:border-zinc-800">
        <Link
          href={parentHref}
          className="hidden w-fit text-sm text-zinc-600 underline-offset-2 hover:text-zinc-950 hover:underline sm:block dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← {parentLabel}
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href={parentHref}
            aria-label={`${icon === "close" ? "Cerrar y volver" : "Volver"} a ${parentLabel}`}
            className="-m-2 shrink-0 rounded-full p-2 text-zinc-600 active:bg-zinc-100 sm:hidden dark:text-zinc-400 dark:active:bg-zinc-800"
          >
            {icons[icon]}
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        </div>
      </div>
      {/* Under the line on phones: the bar keeps only the way out and the title. */}
      {subtitle && (
        <div className="text-zinc-600 dark:text-zinc-400">{subtitle}</div>
      )}
    </header>
  );
}
