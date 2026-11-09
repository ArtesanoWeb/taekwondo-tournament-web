import type { Metadata } from "next";
import Link from "next/link";

import { logout } from "../actions";
import { BottomNav } from "./bottom-nav";

export const metadata: Metadata = {
  title: { default: "Administración", template: "%s · Administración" },
  robots: { index: false },
};

const navLinks = [
  { href: "/admin/torneos", label: "Torneos" },
  { href: "/admin/atletas", label: "Atletas" },
  { href: "/", label: "Ver sitio" },
];

// No session check here: layouts don't re-render on navigation. Each page checks it through
// `getAdminApi()`, and `proxy.ts` already redirects requests without one.
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="hidden items-center justify-between gap-x-4 border-b border-zinc-200 pb-3 sm:flex dark:border-zinc-800">
        <nav aria-label="Administración">
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <li className="font-semibold">Admin</li>
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
      {children}
      <BottomNav />
    </div>
  );
}
