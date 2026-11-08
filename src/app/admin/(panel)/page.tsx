import Link from "next/link";
import { Suspense } from "react";

import { getAdminUsername } from "@/lib/session";

export default function AdminHome() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-tight">Panel</h1>
      {/* Reads the session cookie, so it streams in behind a boundary. */}
      <Suspense>
        <Welcome />
      </Suspense>
      <Link
        href="/admin/torneos"
        className="mt-4 flex flex-col gap-1 rounded-lg border border-zinc-200 p-4 transition-colors hover:border-zinc-400 sm:max-w-sm dark:border-zinc-800 dark:hover:border-zinc-600"
      >
        <span className="font-semibold">Torneos →</span>
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          Ver todos los torneos, iniciarlos y finalizarlos.
        </span>
      </Link>
      <Link
        href="/admin/atletas"
        className="mt-2 flex flex-col gap-1 rounded-lg border border-zinc-200 p-4 transition-colors hover:border-zinc-400 sm:max-w-sm dark:border-zinc-800 dark:hover:border-zinc-600"
      >
        <span className="font-semibold">Atletas →</span>
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          Buscar, crear y editar atletas.
        </span>
      </Link>
    </div>
  );
}

async function Welcome() {
  const username = await getAdminUsername();
  return (
    <p className="text-zinc-600 dark:text-zinc-400">
      Sesión iniciada como <span className="font-medium">{username}</span>.
      Desde aquí vas a gestionar los torneos.
    </p>
  );
}
