"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Admin screens that, on phones, hide the site header to give the screen to their content.
 * Each one shows its way out on the title line instead, through `TitleBar`.
 */
const phoneScreensWithoutHeader = [
  /^\/admin\/torneos\/nuevo$/,
];

export function HeaderFrame({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const hidden = phoneScreensWithoutHeader.some((route) =>
    route.test(pathname),
  );
  return (
    <header className={hidden ? `${className} max-sm:hidden` : className}>
      {children}
    </header>
  );
}
