import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { getSessionUsername } from "@/lib/session";

import { LogoutButton } from "../logout-button";

export const metadata: Metadata = { title: "Más" };

const rowClass =
  "flex w-full items-center justify-between px-4 py-3.5 text-left text-base active:bg-zinc-100 dark:active:bg-zinc-800";
const groupClass =
  "divide-y divide-zinc-200 overflow-hidden rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800";

const chevron = (
  <svg
    aria-hidden
    width={18}
    height={18}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-zinc-400"
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export default function MorePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="sr-only">Más</h1>
      <Suspense fallback={<ProfileCard username="" />}>
        <CurrentProfile />
      </Suspense>

      <ul className={groupClass}>
        <li>
          <Link href="/" className={rowClass}>
            Ver sitio
            {chevron}
          </Link>
        </li>
      </ul>

      <div className={groupClass}>
        <LogoutButton
          className={`${rowClass} font-medium text-red-600 dark:text-red-400`}
        />
      </div>
    </div>
  );
}

async function CurrentProfile() {
  return <ProfileCard username={await getSessionUsername()} />;
}

/** Prototype: the API has no user profiles yet, only the username in the session. */
function ProfileCard({ username }: { username: string }) {
  return (
    <section
      aria-label="Perfil"
      className="flex items-center gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
    >
      <span
        aria-hidden
        className="flex size-14 shrink-0 items-center justify-center rounded-full bg-blue-600 text-2xl font-semibold text-white uppercase"
      >
        {username.charAt(0)}
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-lg font-semibold">
          {username || " "}
        </span>
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          Administrador
        </span>
      </div>
      <span className="ml-auto shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
        Prototipo
      </span>
    </section>
  );
}
