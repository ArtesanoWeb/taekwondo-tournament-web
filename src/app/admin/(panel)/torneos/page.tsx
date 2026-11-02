import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { ErrorNotice } from "@/components/error-notice";
import { LoadingNotice } from "@/components/loading-notice";
import { TournamentStatusBadge } from "@/components/tournament-status-badge";
import { formatDate } from "@/lib/format";
import { adminAttempt, getAdminApi } from "@/lib/session";
import { sortByMostRecent } from "@/lib/tournaments";

import { StatusAction } from "./status-action";

export const metadata: Metadata = { title: "Torneos" };

export default function AdminTournamentsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Torneos</h1>
      <Suspense fallback={<LoadingNotice label="Cargando torneos…" />}>
        <AdminTournamentList />
      </Suspense>
    </div>
  );
}

async function AdminTournamentList() {
  const api = await getAdminApi();
  const result = await adminAttempt(api.GET("/api/v1/tournaments"));
  if (!result.ok) return <ErrorNotice message={result.error.message} />;

  if (result.data.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
        Todavía no hay torneos.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {sortByMostRecent(result.data).map((tournament) => (
        <li
          key={tournament.id}
          className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 sm:flex-row sm:items-start sm:justify-between dark:border-zinc-800"
        >
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-semibold">{tournament.name}</h2>
              <TournamentStatusBadge status={tournament.status} />
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              <time dateTime={tournament.date}>
                {formatDate(tournament.date)}
              </time>
              {" · "}
              {tournament.location}
            </p>
            <Link
              href={`/torneos/${tournament.id}`}
              className="w-fit text-sm text-zinc-600 underline-offset-2 hover:text-zinc-950 hover:underline dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Ver en el sitio público
            </Link>
          </div>
          <StatusAction tournament={tournament} />
        </li>
      ))}
    </ul>
  );
}
