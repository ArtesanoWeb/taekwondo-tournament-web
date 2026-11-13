"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { hidesHeaderOnPhone } from "@/lib/phone-screens";

/** The site header, hidden on phones on the admin's full-screen views (see `phone-screens`). */
export function HeaderFrame({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  const hidden = hidesHeaderOnPhone(usePathname());
  return (
    <header className={hidden ? `${className} max-sm:hidden` : className}>
      {children}
    </header>
  );
}
