import Link from "next/link";

import { BracketStatsSummary } from "@/components/bracket-stats";
import { ErrorNotice } from "@/components/error-notice";
import { api, attempt } from "@/lib/api/client";
import type { Tournament } from "@/lib/api/types";
import { type BracketStats, bracketStats } from "@/lib/bracket";
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
  const liveStats = await fetchLiveStats(inProgress);
  const groups = [
    {
      key: "in_progress",
      label: "En curso",
      tabLabel: "En curso",
      count: inProgress.length,
      empty: "No hay torneos en curso.",
      cards: renderCards(inProgress, liveStats),
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

/**
 * Matches and athletes of the tournaments being played, taken from their brackets because the API
 * doesn't publish the registrations. A tournament with a failed request just shows no numbers.
 */
async function fetchLiveStats(
  tournaments: Tournament[],
): Promise<Map<number, BracketStats | null>> {
  const entries = await Promise.all(
    tournaments.map(async (tournament) => {
      const categories = await attempt(
        api.GET("/api/v1/categories", {
          params: { query: { tournament_id: tournament.id } },
        }),
      );
      if (!categories.ok) return null;
      const brackets = await Promise.all(
        categories.data.map((category) =>
          attempt(
            api.GET("/api/v1/categories/{category_id}/bracket", {
              params: { path: { category_id: category.id } },
            }),
          ),
        ),
      );
      // A 404 is a category whose bracket wasn't drawn yet.
      if (brackets.some((b) => !b.ok && b.error.status !== 404)) return null;
      const matches = brackets.flatMap((b) => (b.ok ? b.data.matches : []));
      return [
        tournament.id,
        matches.length > 0 ? bracketStats(matches) : null,
      ] as const;
    }),
  );
  return new Map(entries.filter((entry) => entry !== null));
}

function renderCards(
  tournaments: Tournament[],
  stats?: Map<number, BracketStats | null>,
) {
  return tournaments.map((tournament) => {
    const tournamentStats = stats?.get(tournament.id);
    return (
      <li key={tournament.id}>
        <Link
          href={`/torneos/${tournament.id}`}
          className="flex h-full items-start justify-between gap-3 rounded-lg border border-zinc-200 p-4 transition-colors hover:border-zinc-400 active:bg-zinc-100 dark:border-zinc-800 dark:hover:border-zinc-600 dark:active:bg-zinc-800"
        >
          <div className="flex min-w-0 flex-col gap-2">
            <h3 className="font-semibold">{tournament.name}</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              <time dateTime={tournament.date}>
                {formatDate(tournament.date)}
              </time>
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {tournament.location}
            </p>
          </div>
          {tournamentStats !== undefined && (
            <BracketStatsSummary
              stats={tournamentStats}
              emptyLabel="Llaves no sorteadas"
            />
          )}
        </Link>
      </li>
    );
  });
}
