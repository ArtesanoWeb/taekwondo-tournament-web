"use client";

import { toggleTheme } from "@/lib/theme";

const iconProps = {
  "aria-hidden": true,
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/**
 * Switches between light and dark. Which icon shows comes from the `dark` class through CSS, so
 * the server and the first render agree whatever the visitor chose.
 */
export function ThemeToggle({ className }: { className: string }) {
  return (
    <button
      type="button"
      onClick={() => toggleTheme()}
      aria-label="Cambiar entre modo claro y oscuro"
      title="Modo claro / oscuro"
      className={className}
    >
      {/* Light now: the moon switches to dark. */}
      <svg {...iconProps} className="dark:hidden">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </svg>
      {/* Dark now: the sun switches to light. */}
      <svg {...iconProps} className="hidden dark:block">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2m-7.07-17.07 1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32 1.41-1.41" />
      </svg>
    </button>
  );
}
