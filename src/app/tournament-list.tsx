import Link from "next/link";

import { ErrorNotice } from "@/components/error-notice";
import { TournamentStatusBadge } from "@/components/tournament-status-badge";
import { api, attempt } from "@/lib/api/client";
import { formatDate } from "@/lib/format";
import { sortByMostRecent } from "@/lib/tournaments";

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

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {sortByMostRecent(result.data).map((tournament) => (
        <li key={tournament.id}>
          <Link
            href={`/torneos/${tournament.id}`}
            className="flex h-full flex-col gap-2 rounded-lg border border-zinc-200 p-4 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
          >
            <div className="flex items-start justify-between gap-3">
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
  );
}
