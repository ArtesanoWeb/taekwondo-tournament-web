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
