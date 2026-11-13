"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, Suspense } from "react";

import { hidesBottomNavOnPhone } from "@/lib/phone-screens";

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

const trophyIcon = (
  <svg {...iconProps}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

const usersIcon = (
  <svg {...iconProps}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const shieldIcon = (
  <svg {...iconProps}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
  </svg>
);

const menuIcon = (
  <svg {...iconProps}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const medalIcon = (
  <svg {...iconProps}>
    <circle cx="12" cy="15" r="6" />
    <path d="M8.5 10.5 6 2h4l2 5 2-5h4l-2.5 8.5" />
  </svg>
);

const itemClass =
  "flex h-16 w-full flex-col items-center justify-center gap-0.5 text-xs";
const inactiveClass = "text-zinc-600 dark:text-zinc-400";
const activeClass = "font-semibold text-blue-600 dark:text-blue-400";

function Tab({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  active: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={`${itemClass} ${active ? activeClass : inactiveClass}`}
      >
        {icon}
        {label}
      </Link>
    </li>
  );
}

/** Torneos, the most used, sits in the middle in a raised blue circle. */
function CenterTab({ active }: { active: boolean }) {
  return (
    <li>
      <Link
        href="/admin/torneos"
        aria-current={active ? "page" : undefined}
        className={`${itemClass} ${active ? activeClass : inactiveClass}`}
      >
        {/* Always blue; the label shows whether it's the active tab. */}
        <span className="ring-background -mt-7 flex size-13 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg ring-4 dark:bg-blue-500">
          {trophyIcon}
        </span>
        Torneos
      </Link>
    </li>
  );
}

function Tabs({ pathname }: { pathname: string }) {
  const active = (prefix: string) => pathname.startsWith(prefix);
  return (
    <>
      <Tab
        href="/admin/atletas"
        label="Atletas"
        icon={usersIcon}
        active={active("/admin/atletas")}
      />
      <Tab
        href="/admin/clubes"
        label="Clubes"
        icon={shieldIcon}
        active={active("/admin/clubes")}
      />
      {/* A category is reached from its tournament, so it belongs to the same tab. */}
      <CenterTab
        active={active("/admin/torneos") || active("/admin/categorias")}
      />
      <Tab
        href="/admin/rankings"
        label="Rankings"
        icon={medalIcon}
        active={active("/admin/rankings")}
      />
      <Tab
        href="/admin/mas"
        label="Más"
        icon={menuIcon}
        active={active("/admin/mas")}
      />
    </>
  );
}

function CurrentTabs() {
  return <Tabs pathname={usePathname()} />;
}

/** Thumb-reach navigation for phones, except on full-screen forms (see `phone-screens`). */
export function BottomNav() {
  return (
    // The route is request data under Cache Components; the fallback keeps the bar in the shell.
    <Suspense fallback={<BottomNavBar />}>
      <CurrentBottomNav />
    </Suspense>
  );
}

function CurrentBottomNav() {
  return hidesBottomNavOnPhone(usePathname()) ? null : <BottomNavBar />;
}

function BottomNavBar() {
  return (
    <nav
      aria-label="Administración"
      className="bg-background fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 pb-[env(safe-area-inset-bottom)] sm:hidden dark:border-zinc-800"
    >
      <ul className="grid grid-cols-5">
        <Suspense fallback={<Tabs pathname="" />}>
          <CurrentTabs />
        </Suspense>
      </ul>
    </nav>
  );
}
