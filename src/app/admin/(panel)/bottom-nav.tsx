"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, Suspense, useEffect, useRef } from "react";

import { logout } from "../actions";

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

const menuIcon = (
  <svg {...iconProps}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const itemClass =
  "flex h-16 w-full flex-col items-center justify-center gap-0.5 text-xs";
const inactiveClass = "text-zinc-600 dark:text-zinc-400";
const activeClass = "font-semibold text-blue-600 dark:text-blue-400";
const sheetRowClass =
  "block w-full rounded-md px-3 py-3 text-left text-base hover:bg-zinc-100 active:bg-zinc-100 dark:hover:bg-zinc-800 dark:active:bg-zinc-800";

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

function Tabs({ pathname }: { pathname: string }) {
  // A category is reached from its tournament, so it belongs to the same tab.
  const inTournaments =
    pathname.startsWith("/admin/torneos") ||
    pathname.startsWith("/admin/categorias");

  return (
    <>
      <Tab
        href="/admin/torneos"
        label="Torneos"
        icon={trophyIcon}
        active={inTournaments}
      />
      <Tab
        href="/admin/atletas"
        label="Atletas"
        icon={usersIcon}
        active={pathname.startsWith("/admin/atletas")}
      />
    </>
  );
}

function CurrentTabs() {
  return <Tabs pathname={usePathname()} />;
}

/** Thumb-reach navigation for phones. */
export function BottomNav() {
  const sheetRef = useRef<HTMLDialogElement>(null);
  const closeSheet = () => sheetRef.current?.close();

  // Reserves the bar's space (see `globals.css`). An effect and not CSS `:has()`: Next keeps the
  // previous page hidden in the DOM, but its effects are cleaned up when it leaves the screen.
  useEffect(() => {
    document.body.classList.add("has-bottom-nav");
    return () => document.body.classList.remove("has-bottom-nav");
  }, []);

  return (
    <nav
      aria-label="Administración"
      className="bg-background fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 pb-[env(safe-area-inset-bottom)] sm:hidden dark:border-zinc-800"
    >
      <ul className="grid grid-cols-3">
        {/* The route is request data under Cache Components; the fallback keeps the bar in the shell. */}
        <Suspense fallback={<Tabs pathname="" />}>
          <CurrentTabs />
        </Suspense>
        <li>
          <button
            type="button"
            onClick={() => sheetRef.current?.showModal()}
            className={`${itemClass} ${inactiveClass}`}
          >
            {menuIcon}
            Más
          </button>
        </li>
      </ul>

      {/* A click on the backdrop targets the dialog itself; the content is wrapped so it doesn't. */}
      <dialog
        ref={sheetRef}
        aria-label="Más opciones"
        onClick={(event) => {
          if (event.target === sheetRef.current) closeSheet();
        }}
        className="mt-auto mb-0 w-full max-w-none rounded-t-2xl bg-white text-zinc-950 backdrop:bg-black/50 dark:bg-zinc-900 dark:text-zinc-50"
      >
        <div className="flex flex-col gap-1 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <Link
            href="/admin/clubes"
            onClick={closeSheet}
            className={sheetRowClass}
          >
            Clubes
          </Link>
          <Link href="/" onClick={closeSheet} className={sheetRowClass}>
            Ver sitio
          </Link>
          <form action={logout}>
            <button type="submit" className={sheetRowClass}>
              Cerrar sesión
            </button>
          </form>
        </div>
      </dialog>
    </nav>
  );
}
