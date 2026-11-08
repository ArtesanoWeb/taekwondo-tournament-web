import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { ErrorNotice } from "@/components/error-notice";
import { LoadingNotice } from "@/components/loading-notice";
import { TournamentStatusBadge } from "@/components/tournament-status-badge";
import { formatDate } from "@/lib/format";
import { adminAttempt, getAdminApi } from "@/lib/session";
import { sortByMostRecent } from "@/lib/tournaments";

export const metadata: Metadata = { title: "Torneos" };

export default function AdminTournamentsPage({
  searchParams,
}: PageProps<"/admin/torneos">) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Torneos</h1>
        <Link
          href="/admin/torneos/nuevo"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Nuevo torneo
        </Link>
      </div>
      <Suspense fallback={<LoadingNotice label="Cargando torneos…" />}>
        <AdminTournamentList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function AdminTournamentList({
  searchParams,
}: Pick<PageProps<"/admin/torneos">, "searchParams">) {
  const api = await getAdminApi();
  const [result, { creado }] = await Promise.all([
    adminAttempt(api.GET("/api/v1/tournaments")),
    searchParams,
  ]);
  if (!result.ok) return <ErrorNotice message={result.error.message} />;

  // `?creado=<id>` comes from the "Nuevo torneo" form: confirm it and highlight the new one.
  const createdId = Number(creado);
  const created = result.data.find((t) => t.id === createdId);

  if (result.data.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
        Todavía no hay torneos.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {created && (
        <p
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
        >
          Torneo creado: <span className="font-medium">{created.name}</span>. Ya
          puedes preparar sus categorías e inscripciones.
        </p>
      )}
      <ul className="flex flex-col gap-3">
        {sortByMostRecent(result.data).map((tournament) => (
          <li key={tournament.id}>
            {/* The whole card is the link: on a phone there's no hover and small targets are hard to hit. */}
            <Link
              href={`/admin/torneos/${tournament.id}`}
              className={`flex flex-col gap-1 rounded-lg border p-4 transition-colors hover:bg-zinc-50 active:bg-zinc-100 dark:hover:bg-zinc-900 dark:active:bg-zinc-800 ${
                tournament.id === created?.id
                  ? "border-emerald-400 ring-2 ring-emerald-400/30 dark:border-emerald-600"
                  : "border-zinc-200 dark:border-zinc-800"
              }`}
            >
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
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
