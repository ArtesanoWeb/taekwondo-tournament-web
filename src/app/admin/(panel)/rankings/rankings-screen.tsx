import Link from "next/link";
import { Suspense } from "react";

import { ErrorNotice } from "@/components/error-notice";
import { LoadingNotice } from "@/components/loading-notice";
import type { Tournament } from "@/lib/api/types";
import { formatDate } from "@/lib/format";
import { adminAttempt, getAdminApi } from "@/lib/session";
import { groupTournamentsByStatus } from "@/lib/tournaments";

/**
 * The Rankings section (see `AdminSections`): each tournament has its own club ranking, so this
 * lists the tournaments that already started and each one opens its ranking.
 */
export function RankingsScreen() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="sr-only">Rankings</h1>
      <Suspense fallback={<LoadingNotice label="Cargando torneos…" />}>
        <RankedTournaments />
      </Suspense>
    </div>
  );
}

async function RankedTournaments() {
  const api = await getAdminApi();
  const result = await adminAttempt(api.GET("/api/v1/tournaments"));
  if (!result.ok) return <ErrorNotice message={result.error.message} />;

  const { inProgress, finished } = groupTournamentsByStatus(result.data);
  if (inProgress.length + finished.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
        Todavía no hay torneos iniciados. Cada torneo tiene su ranking de clubes
        desde que empieza.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Cada torneo tiene su propio ranking de clubes: oro 7, plata 3, bronce 1
        y categoría sin pelea 1.
      </p>
      <TournamentGroup label="En curso" tournaments={inProgress} />
      <TournamentGroup label="Finalizados" tournaments={finished} />
    </div>
  );
}

function TournamentGroup({
  label,
  tournaments,
}: {
  label: string;
  tournaments: Tournament[];
}) {
  if (tournaments.length === 0) return null;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold tracking-wide text-zinc-500 uppercase">
        {label}
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {tournaments.map((tournament) => (
          <li key={tournament.id}>
            <Link
              href={`/admin/rankings/${tournament.id}`}
              className="flex h-full items-center justify-between gap-3 rounded-lg border border-zinc-200 p-4 transition-colors hover:border-zinc-400 active:bg-zinc-100 dark:border-zinc-800 dark:hover:border-zinc-600 dark:active:bg-zinc-800"
            >
              <span className="flex min-w-0 flex-col gap-1">
                <span className="truncate font-semibold">
                  {tournament.name}
                </span>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  <time dateTime={tournament.date}>
                    {formatDate(tournament.date)}
                  </time>
                </span>
              </span>
              <span aria-hidden className="text-xl text-zinc-400">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
