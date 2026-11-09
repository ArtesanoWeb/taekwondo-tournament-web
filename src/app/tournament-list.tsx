import Link from "next/link";

import { ErrorNotice } from "@/components/error-notice";
import { TournamentStatusBadge } from "@/components/tournament-status-badge";
import { api, attempt } from "@/lib/api/client";
import type { Tournament } from "@/lib/api/types";
import { formatDate } from "@/lib/format";
import { groupTournamentsByStatus } from "@/lib/tournaments";

import { PublicTournamentTabs } from "./public-tournament-tabs";

export async function TournamentList() {
  const result = await attempt(api.GET("/api/v1/tournaments"));
  if (!result.ok) return <ErrorNotice message={result.error.message} />;

  if (result.data.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
        Todavía no hay torneos publicados.
      </p>
    );
  }

  const { inProgress, open, finished } = groupTournamentsByStatus(result.data);
  const groups = [
    {
      key: "in_progress",
      label: "En curso",
      tabLabel: "En curso",
      count: inProgress.length,
      empty: "No hay torneos en curso.",
      cards: renderCards(inProgress),
    },
    {
      key: "open",
      label: "Inscripciones abiertas",
      // The full label doesn't fit in a third of a phone screen.
      tabLabel: "Inscripciones",
      count: open.length,
      empty: "No hay torneos con inscripciones abiertas.",
      cards: renderCards(open),
    },
    {
      key: "finished",
      label: "Finalizados",
      tabLabel: "Finalizados",
      count: finished.length,
      empty: "No hay torneos finalizados.",
      cards: renderCards(finished),
    },
  ];

  return (
    <PublicTournamentTabs
      groups={groups}
      initialIndex={Math.max(
        groups.findIndex((group) => group.count > 0),
        0,
      )}
    />
  );
}

function renderCards(tournaments: Tournament[]) {
  return tournaments.map((tournament) => (
    <li key={tournament.id}>
      <Link
        href={`/torneos/${tournament.id}`}
        className="flex h-full flex-col gap-2 rounded-lg border border-zinc-200 p-4 transition-colors hover:border-zinc-400 active:bg-zinc-100 dark:border-zinc-800 dark:hover:border-zinc-600 dark:active:bg-zinc-800"
      >
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold">{tournament.name}</h3>
          <TournamentStatusBadge status={tournament.status} />
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          <time dateTime={tournament.date}>{formatDate(tournament.date)}</time>
        </p>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {tournament.location}
        </p>
      </Link>
    </li>
  ));
}
