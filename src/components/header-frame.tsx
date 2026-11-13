"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { LOGIN_PATH } from "@/lib/auth";
import { hidesHeaderOnPhone } from "@/lib/phone-screens";

import { LogoutButton } from "./logout-button";
import { headerClass, headerRowClass } from "./header-classes";

const logoutIcon = (
  <svg
    aria-hidden
    width={20}
    height={20}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5M21 12H9" />
  </svg>
);

/**
 * The site header as it depends on the route: hidden on phones on full-screen views (see
 * `phone-screens`), and with a logout button on the admin's screens, on phones only (on larger
 * screens the admin menu has it).
 */
const inAdmin = (pathname: string) =>
  pathname.startsWith("/admin") && !pathname.startsWith(LOGIN_PATH);

export function HeaderFrame({ brand }: { brand: ReactNode }) {
  const pathname = usePathname();
  const hidden = hidesHeaderOnPhone(pathname);
  return (
    <header className={hidden ? `${headerClass} max-sm:hidden` : headerClass}>
      <div className={headerRowClass}>
        {brand}
        {inAdmin(pathname) && (
          <LogoutButton className="flex size-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white active:bg-zinc-700 sm:hidden dark:bg-zinc-100 dark:text-zinc-900 dark:active:bg-zinc-300">
            {logoutIcon}
          </LogoutButton>
        )}
      </div>
    </header>
  );
}
